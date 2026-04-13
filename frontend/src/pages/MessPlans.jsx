import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material'
import { Add, Edit, Delete, People, Payment } from '@mui/icons-material'
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../services/messService'
import api from '../api/api'

function MessPlans() {
  const [plans, setPlans] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formValues, setFormValues] = useState({
    name: '',
    price: '',
    durationInDays: '',
  })

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planDetails, setPlanDetails] = useState({ students: [], payments: [] })
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsTab, setDetailsTab] = useState(0)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setError('')
        const data = await getPlans()
        setPlans(data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load mess plans.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const fetchPlanDetails = async (planId) => {
    setDetailsLoading(true)
    try {
      const [studentsRes, paymentsRes] = await Promise.all([
        api.get(`/mess/plans/${planId}/students`),
        api.get(`/mess/plans/${planId}/payments`),
      ])
      setPlanDetails({
        students: studentsRes.data?.data || [],
        payments: paymentsRes.data?.data || [],
      })
    } catch (err) {
      console.error('Failed to load plan details:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan)
    fetchPlanDetails(plan._id)
  }

  const openCreateDialog = () => {
    setEditingPlan(null)
    setFormValues({ name: '', price: '', durationInDays: '' })
    setIsDialogOpen(true)
  }

  const openEditDialog = (plan) => {
    setEditingPlan(plan)
    setFormValues({
      name: plan.name,
      price: plan.price?.toString() ?? '',
      durationInDays: plan.durationInDays?.toString() ?? '',
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPlan(null)
    setError('')
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSavePlan = async () => {
    const payload = {
      name: formValues.name.trim(),
      price: Number(formValues.price),
      durationInDays: Number(formValues.durationInDays),
    }

    if (!payload.name || !payload.price || !payload.durationInDays) {
      setError('Please fill in all fields with valid values.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingPlan?._id) {
        const updatedPlan = await updatePlan(editingPlan._id, payload)
        setPlans((prev) => prev.map((plan) => (plan._id === updatedPlan._id ? updatedPlan : plan)))
      } else {
        const createdPlan = await createPlan(payload)
        setPlans((prev) => [createdPlan, ...prev])
      }

      handleCloseDialog()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save mess plan.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = async (planId) => {
    const confirmed = window.confirm('Delete this mess plan?')
    if (!confirmed) return

    try {
      setError('')
      await deletePlan(planId)
      setPlans((prev) => prev.filter((plan) => plan._id !== planId))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete plan.')
    }
  }

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Mess Plans
          </Typography>
          <Typography color="text.secondary">
            Create and manage mess plans for students.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2, textTransform: 'none', py: 1.2, px: 3 }}
        >
          Add New Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search plans by name"
          fullWidth
          size="small"
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {plans
            .filter((plan) => plan.name.toLowerCase().includes(search.trim().toLowerCase()))
            .map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 20px 40px rgba(15,23,42,0.12)' },
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handlePlanClick(plan)}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {plan.name}
                    </Typography>
                    <Typography color="primary" fontSize={20} fontWeight={700} mb={1}>
                      ₹{plan.price}
                    </Typography>
                    <Typography color="text.secondary" mb={2}>
                      {plan.durationInDays} days
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Active" color="success" size="small" />
                      <Box>
                        <IconButton color="primary" size="small" onClick={(e) => { e.stopPropagation(); openEditDialog(plan); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan._id); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          {plans.filter((plan) => plan.name.toLowerCase().includes(search.trim().toLowerCase())).length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">
                  {plans.length === 0
                    ? 'No mess plans available. Add a plan to get started.'
                    : 'No plans match your search.'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Plan Details Dialog */}
      <Dialog open={!!selectedPlan} onClose={() => setSelectedPlan(null)} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedPlan?.name} - Details
        </DialogTitle>
        <DialogContent>
          <Tabs value={detailsTab} onChange={(e, newValue) => setDetailsTab(newValue)} sx={{ mb: 2 }}>
            <Tab icon={<People />} label="Students" />
            <Tab icon={<Payment />} label="Payments" />
          </Tabs>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {detailsTab === 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {planDetails.students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No students</TableCell>
                        </TableRow>
                      ) : (
                        planDetails.students.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={student.status}
                                color={student.status === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(student.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(student.endDate).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {detailsTab === 1 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {planDetails.payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No payments</TableCell>
                        </TableRow>
                      ) : (
                        planDetails.payments.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell>{payment.userId?.name || 'Unknown'}</TableCell>
                            <TableCell>₹{payment.amount}</TableCell>
                            <TableCell>
                              <Chip
                                label={payment.status}
                                color={payment.status === 'success' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPlan(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingPlan ? 'Edit Mess Plan' : 'New Mess Plan'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1, py: 1 }}>
          <TextField
            label="Plan Name"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Price (₹)"
            name="price"
            type="number"
            value={formValues.price}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Duration (days)"
            name="durationInDays"
            type="number"
            value={formValues.durationInDays}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePlan}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            {editingPlan ? 'Save Changes' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MessPlans
