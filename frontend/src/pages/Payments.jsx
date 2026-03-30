import React from 'react'
import { Box } from '@mui/material'
import PaymentSummaryCards from '../components/dashboard/student/payments/PaymentSummaryCards'
import PaymentRecordsTable from '../components/dashboard/student/payments/PaymentRecordsTable'

function Payments() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary Cards */}
      <PaymentSummaryCards />

      {/* Payment Records Table */}
      <PaymentRecordsTable />
    </Box>
  )
}

export default Payments
