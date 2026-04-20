import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import PaymentSummaryCards from '../components/dashboard/student/payments/PaymentSummaryCards'
import PaymentRecordsTable from '../components/dashboard/student/payments/PaymentRecordsTable'
import api from '../api/api'

function Payments({ payments: initialPayments = [], searchQuery = '', renewal = null }) {
  const [payments, setPayments] = useState(initialPayments)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const typeFilteredPayments = payments.filter((payment) => {
    if (filter === 'hostel') return payment.type === 'hostel' || payment.type === 'room_request'
    if (filter === 'mess') return payment.type === 'mess'
    return true
  })

  const filteredPayments = searchQuery.trim()
    ? typeFilteredPayments.filter((payment) => {
      const q = searchQuery.toLowerCase()
      return [
        payment.type,
        payment.status,
        payment.paymentMethod,
        String(payment.amount ?? ''),
        payment.transactionId,
      ].some((field) => String(field || '').toLowerCase().includes(q))
    })
    : typeFilteredPayments

  const fetchPayments = async () => {
    try {
      setError('')
      const response = await api.get('/payments/history')
      setPayments(response.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchPayments}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <PaymentSummaryCards payments={payments} renewal={renewal} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Showing {filteredPayments.length} payment record{filteredPayments.length === 1 ? '' : 's'}
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          size="small"
          onChange={(_, value) => {
            if (value) setFilter(value)
          }}
          aria-label="payment filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="hostel">Hostel</ToggleButton>
          <ToggleButton value="mess">Mess</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Payment Records Table */}
      <PaymentRecordsTable payments={filteredPayments} searchQuery={searchQuery} />
    </Box>
  )
}

export default Payments
