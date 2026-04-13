import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import { getPayments } from '../services/messService'

function MessPayments() {
  const [payments, setPayments] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPayments = async () => {
    try {
      setError('')
      setLoading(true)
      const response = await getPayments()
      setPayments(response.data || [])
      setTotalRevenue(response.totalRevenue || 0)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

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
        <Card sx={{ p: 2, minWidth: 240, bgcolor: '#fff' }}>
          <CardContent>
            <Typography fontSize={12} color="text.secondary" gutterBottom>
              Total revenue
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              ₹{totalRevenue}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <Table>
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
                    No payment records found.
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
    </Box>
  )
}

export default MessPayments
