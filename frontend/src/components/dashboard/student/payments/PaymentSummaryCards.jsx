import React, { useMemo } from 'react'
import { Box, Card, Typography } from '@mui/material'

export default function PaymentSummaryCards({ payments = [] }) {
  const summary = useMemo(() => {
    const relevantPayments = payments.filter((payment) =>
      ['hostel', 'room_request', 'mess'].includes(payment.type)
    )

    const paidTotal = relevantPayments
      .filter((payment) => payment.status === 'success')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const pendingTotal = relevantPayments
      .filter((payment) => payment.status === 'pending' || payment.status === 'failed')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const nextPending = relevantPayments
      .filter((payment) => payment.status === 'pending' || payment.status === 'failed')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]

    return {
      totalPaid: `₹${paidTotal.toFixed(2)}`,
      pendingDues: `₹${pendingTotal.toFixed(2)}`,
      nextDueDate: nextPending
        ? new Date(nextPending.createdAt).toLocaleDateString()
        : 'No dues',
    }
  }, [payments])

  const cards = [
    {
      label: 'Total Paid',
      value: summary.totalPaid,
      color: 'text.primary',
    },
    {
      label: 'Pending Dues',
      value: summary.pendingDues,
      color: 'warning.main',
    },
    {
      label: 'Next Due Date For Hostel Rent',
      value: summary.nextDueDate,
      color: 'text.primary',
    },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
      {cards.map((card, idx) => (
        <Card
          key={idx}
          sx={{
            p: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {card.label}
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            color={card.color}
            sx={{ mt: 0.5 }}
          >
            {card.value}
          </Typography>
        </Card>
      ))}
    </Box>
  )
}
