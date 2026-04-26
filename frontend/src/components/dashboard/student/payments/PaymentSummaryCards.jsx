import React, { useMemo } from 'react'
import { Box, Card, Typography } from '@mui/material'

export default function PaymentSummaryCards({ payments = [], renewal = null }) {
  const summary = useMemo(() => {
    const relevantPayments = payments.filter((payment) =>
      ['hostel', 'room_request', 'mess'].includes(payment.type)
    )

    const paidTotal = relevantPayments
      .filter((payment) => payment.status === 'success')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const pendingTotal = relevantPayments
      .filter((payment) => payment.status === 'pending')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const nextPending = relevantPayments
      .filter((payment) => payment.status === 'pending')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]

    const dueDateFromCycle = renewal?.dueDate
      ? new Date(renewal.dueDate).toLocaleDateString()
      : ''

    const semesterStartFromCycle = renewal?.paymentWindowStart
      ? new Date(renewal.paymentWindowStart).toLocaleDateString()
      : ''

    return {
      totalPaid: `₹${paidTotal.toFixed(2)}`,
      pendingDues: `₹${pendingTotal.toFixed(2)}`,
      nextDueDate: dueDateFromCycle
        ? dueDateFromCycle
        : nextPending
          ? new Date(nextPending.createdAt).toLocaleDateString()
          : 'No dues',
      semesterStartsText: dueDateFromCycle
        ? `Sem starts: ${semesterStartFromCycle || 'N/A'}`
        : '',
    }
  }, [payments, renewal])

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
      label: 'Hostel Due Date',
      value: summary.nextDueDate,
      color: 'text.primary',
      extraText: summary.semesterStartsText,
    },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
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
            sx={{ mt: 0.5, fontSize: { xs: '1.65rem', sm: '2.35rem' } }}
          >
            {card.value}
          </Typography>
          {card.extraText ? (
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
              {`(${card.extraText})`}
            </Typography>
          ) : null}
        </Card>
      ))}
    </Box>
  )
}
