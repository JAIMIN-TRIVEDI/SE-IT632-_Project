import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
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
import { getPayments } from '../services/messService'
import { useSearch } from '../hooks/useSearch'

function MessPayments() {
  const [payments, setPayments] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' })
  const { search, setSearch, isDebouncing, buildSearchParams } = useSearch('', 400)

  const fetchPayments = async () => {
    try {
      setError('')
      setLoading(true)
      const response = await getPayments(buildSearchParams())
      setPayments(response.data || [])
      setTotalRevenue(response.totalRevenue || 0)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load payments.')
      setSnack({ open: true, message: 'Unable to load payments.', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [buildSearchParams])

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Mess Payments
          </Typography>
          <Typography color="text.secondary">
            Review all mess payment transactions.
          </Typography>
        </Box>
        <Card sx={{ p: 2, minWidth: { xs: '100%', sm: 240 }, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography fontSize={12} color="text.secondary" gutterBottom>
              Total revenue
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              ₹{totalRevenue}
            </Typography>
          </CardContent>
        </Card>
        <Button variant="outlined" onClick={fetchPayments} disabled={loading} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by student, transaction id, or status"
          fullWidth
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchPayments}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading || isDebouncing ? (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}><Skeleton variant="text" height={34} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    {search.trim() ? 'No results found.' : 'No payment records found.'}
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment._id} hover>
                    <TableCell>{payment.userId?.name || payment.userId?.email || 'Unknown'}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{payment.purpose || 'Mess payment'}</TableCell>
                    <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
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

export default MessPayments
