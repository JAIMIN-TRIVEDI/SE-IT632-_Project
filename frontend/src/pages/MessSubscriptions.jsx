import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Alert,
  TextField,
} from '@mui/material'
import { getSubscriptions, approveRefund } from '../services/messService'
import { useSearch } from '../hooks/useSearch'

function MessSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })
  const { search, setSearch, isDebouncing, buildSearchParams } = useSearch('', 400)

  const fetchSubscriptions = async () => {
    try {
      setError('')
      setLoading(true)
      const data = await getSubscriptions(buildSearchParams())
      setSubscriptions(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load subscriptions.')
      setSnack({ open: true, message: 'Unable to load subscriptions.', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRefund = async (id) => {
    try {
      setActionLoading(true)
      await approveRefund(id)
      await fetchSubscriptions()
      setSnack({ open: true, message: 'Refund approved successfully.', severity: 'success' })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve refund.')
      setSnack({ open: true, message: 'Failed to approve refund.', severity: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [buildSearchParams])

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Mess Subscriptions
          </Typography>
          <Typography color="text.secondary">
            Review active subscriptions and process refund requests.
          </Typography>
        </Box>
        <Card sx={{ minWidth: 240, p: 2, bgcolor: '#fff' }}>
          <CardContent>
            <Typography fontSize={12} color="text.secondary" gutterBottom>
              Pending refund requests
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {subscriptions.filter((sub) => sub.refund?.requested && !sub.refund?.approved).length}
            </Typography>
          </CardContent>
        </Card>
        <Button variant="outlined" onClick={fetchSubscriptions} disabled={loading || actionLoading} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by student, plan, or status"
          fullWidth
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchSubscriptions}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading || isDebouncing ? (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Refund</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}><Skeleton variant="text" height={34} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Refund</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    {search.trim() ? 'No results found.' : 'No subscriptions found.'}
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub._id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{sub.studentId?.name || 'Unknown'}</Typography>
                      <Typography fontSize={12} color="text.secondary">{sub.studentId?.email}</Typography>
                    </TableCell>
                    <TableCell>{sub.planId?.name || 'Plan not found'}</TableCell>
                    <TableCell>
                      <Chip
                        label={sub.status || 'unknown'}
                        color={sub.status === 'active' ? 'success' : sub.status === 'cancelled' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      {sub.refund?.requested ? (
                        <Typography fontSize={12} color="text.secondary">
                          ₹{sub.refund?.amount ?? 0} requested
                        </Typography>
                      ) : (
                        <Typography fontSize={12} color="text.secondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {sub.refund?.requested && !sub.refund?.approved ? (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={actionLoading}
                          onClick={() => handleApproveRefund(sub._id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Approve refund
                        </Button>
                      ) : (
                        <Typography color="text.secondary" fontSize={12}>
                          No action
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

export default MessSubscriptions
