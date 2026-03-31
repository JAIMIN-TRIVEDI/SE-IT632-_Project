import React from 'react'
import { Box } from '@mui/material'
import PaymentSummaryCards from '../components/dashboard/student/payments/PaymentSummaryCards'
import PaymentRecordsTable from '../components/dashboard/student/payments/PaymentRecordsTable'

function Payments({ payments }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary Cards */}
      <PaymentSummaryCards payments={payments} />

      {/* Payment Records Table */}
      <PaymentRecordsTable payments={payments} />
    </Box>
  )
}

export default Payments
