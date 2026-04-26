import { useCallback, useEffect, useState } from 'react'
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
  FormControlLabel,
  FormGroup,
  Checkbox,
  TextField,
  CircularProgress,
  IconButton,
  Alert,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Skeleton,
} from '@mui/material'
import { Add, Edit, Delete, People, Payment } from '@mui/icons-material'
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../services/messService'
import api from '../api/api'
import { useSearch } from '../hooks/useSearch'

function MessPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [deletingPlan, setDeletingPlan] = useState(null)
  const [formValues, setFormValues] = useState({
    name: '',
    price: '',
    durationInDays: '',
    status: 'active',
    meals: {
      breakfast: true,
      lunch: true,
      snacks: true,
      dinner: true,
    },
  })

  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planDetails, setPlanDetails] = useState({ students: [], payments: [] })
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsTab, setDetailsTab] = useState(0)

  const { search, setSearch, isDebouncing, buildSearchParams } = useSearch('', 400)

  const fetchPlans = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const data = await getPlans(buildSearchParams())
      setPlans(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load mess plans.')
    } finally {
      setLoading(false)
    }
  }, [buildSearchParams])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

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
      const message = err.response?.data?.message || 'Failed to load plan details.'
      setSnack({ open: true, message, severity: 'error' })
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
    setFormValues({
      name: '',
      price: '',
      durationInDays: '',
      status: 'active',
      meals: {
        breakfast: true,
        lunch: true,
        snacks: true,
        dinner: true,
      },
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (plan) => {
    setEditingPlan(plan)
    setFormValues({
      name: plan.name,
      price: plan.price?.toString() ?? '',
      durationInDays: (plan.duration ?? plan.durationInDays)?.toString() ?? '',
      status: plan.status || 'active',
      meals: {
        breakfast: Boolean(plan.meals?.breakfast),
        lunch: Boolean(plan.meals?.lunch),
        snacks: Boolean(plan.meals?.snacks),
        dinner: Boolean(plan.meals?.dinner),
      },
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

  const handleMealChange = (meal, checked) => {
    setFormValues((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        [meal]: checked,
      },
    }))
  }

  const handleSavePlan = async () => {
    const payload = {
      name: formValues.name.trim(),
      price: Number(formValues.price),
      duration: Number(formValues.durationInDays),
      status: formValues.status,
      meals: formValues.meals,
    }

    if (!payload.name || !payload.price || !payload.duration || !payload.status) {
      setError('Please fill in all fields with valid values.')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingPlan?._id) {
        await updatePlan(editingPlan._id, payload)
        await fetchPlans()
        setSnack({ open: true, message: 'Plan updated successfully.', severity: 'success' })
      } else {
        await createPlan(payload)
        await fetchPlans()
        setSnack({ open: true, message: 'Plan created successfully.', severity: 'success' })
      }

      handleCloseDialog()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save mess plan.')
      setSnack({ open: true, message: 'Failed to save mess plan.', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const openDeleteDialog = (plan) => {
    setDeletingPlan(plan)
  }

  const closeDeleteDialog = () => {
    if (deleting) return
    setDeletingPlan(null)
  }

  const handleDeletePlan = async () => {
    if (!deletingPlan?._id) return

    try {
      setDeleting(true)
      setError('')
      await deletePlan(deletingPlan._id)
      await fetchPlans()
      setDeletingPlan(null)
      setSnack({ open: true, message: 'Plan deleted successfully.', severity: 'success' })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete plan.')
      setSnack({ open: true, message: 'Failed to delete plan.', severity: 'error' })
    } finally {
      setDeleting(false)
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
          disabled={loading || saving || deleting}
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
          placeholder="Search plans by name or price"
          fullWidth
          size="small"
        />
      </Box>

      {loading || isDebouncing ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} item xs={12} sm={6} md={4}>
              <Skeleton variant="rounded" height={180} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
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
                      {plan.duration ?? plan.durationInDays} days
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={plan.status || 'active'}
                        color={(plan.status || 'active') === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                      <Box>
                        <IconButton color="primary" size="small" onClick={(e) => { e.stopPropagation(); openEditDialog(plan); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); openDeleteDialog(plan); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          {plans.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">
                  {search.trim()
                    ? 'No results found for your search.'
                    : 'No mess plans available. Add a plan to get started.'}
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
          <Tabs value={detailsTab} onChange={(e, newValue) => setDetailsTab(newValue)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2 }}>
            <Tab icon={<People />} label="Students" />
            <Tab icon={<Payment />} label="Payments" />
          </Tabs>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Included Meals
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((meal) => (
                <Chip
                  key={meal}
                  label={meal.charAt(0).toUpperCase() + meal.slice(1)}
                  color={selectedPlan?.meals?.[meal] ? 'success' : 'default'}
                  variant={selectedPlan?.meals?.[meal] ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {detailsTab === 0 && (
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 720 }}>
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
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 680 }}>
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
          <TextField
            select
            label="Status"
            name="status"
            value={formValues.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Meals Included
            </Typography>
            <FormGroup row>
              {[
                { key: 'breakfast', label: 'Breakfast' },
                { key: 'lunch', label: 'Lunch' },
                { key: 'snacks', label: 'Snacks' },
                { key: 'dinner', label: 'Dinner' },
              ].map((meal) => (
                <FormControlLabel
                  key={meal.key}
                  control={
                    <Checkbox
                      checked={Boolean(formValues.meals?.[meal.key])}
                      onChange={(event) => handleMealChange(meal.key, event.target.checked)}
                    />
                  }
                  label={meal.label}
                />
              ))}
            </FormGroup>
          </Box>
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
            {saving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deletingPlan} onClose={closeDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete {deletingPlan?.name || 'this plan'}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDeleteDialog} disabled={deleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeletePlan}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MessPlans
