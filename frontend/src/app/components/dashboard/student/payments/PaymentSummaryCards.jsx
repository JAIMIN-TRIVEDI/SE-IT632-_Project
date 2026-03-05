import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import { paymentSummary } from './data'

export default function PaymentSummaryCards() {
  const cards = [
    {
      label: 'Total Paid',
      value: paymentSummary.totalPaid,
      color: 'text.primary',
    },
    {
      label: 'Pending Dues',
      value: paymentSummary.pendingDues,
      color: 'warning.main',
    },
    {
      label: 'Next Due Date',
      value: paymentSummary.nextDueDate,
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
