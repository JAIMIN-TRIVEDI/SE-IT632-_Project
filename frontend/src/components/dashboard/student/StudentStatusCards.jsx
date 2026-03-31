import React from 'react'
import { Box, Card, Typography, Chip } from '@mui/material'
import {
  KingBed,
  Restaurant,
  CreditCard,
  CheckCircle,
} from '@mui/icons-material'

const iconMap = {
  KingBed: KingBed,
  Restaurant: Restaurant,
  CreditCard: CreditCard,
  CheckCircle: CheckCircle,
}

export default function StudentStatusCards({ dashboardData }) {
  const room = dashboardData?.room
  const payments = dashboardData?.payments || []
  const openComplaints = dashboardData?.openComplaints ?? 0
  const latestPayment = payments[0]

  const cards = [
    {
      label: 'Room Number',
      value: room?.roomNumber || 'Unassigned',
      sub: room?.hostelName ? `${room.hostelName} · ${room.hostelType || ''}`.trim() : 'No room assigned',
      tag: 'LOCATION',
      icon: 'KingBed',
      tagColor: '#2563eb',
      tagBg: '#eff6ff',
    },
    {
      label: 'Mess Status',
      value: 'Regular',
      sub: 'Monthly plan',
      tag: 'ACTIVE',
      icon: 'Restaurant',
      tagColor: '#16a34a',
      tagBg: '#f0fdf4',
    },
    {
      label: 'Payment Status',
      value: latestPayment ? (latestPayment.status === 'success' ? 'Paid' : 'Pending') : 'No payments',
      sub: latestPayment ? `Last payment: ${new Date(latestPayment.createdAt).toLocaleDateString()}` : 'No records found',
      tag: latestPayment?.status === 'success' ? 'PAID' : 'DUE',
      icon: 'CreditCard',
      tagColor: latestPayment?.status === 'success' ? '#059669' : '#b45309',
      tagBg: latestPayment?.status === 'success' ? '#d1fae5' : '#fef3c7',
    },
    {
      label: 'Open Complaints',
      value: `${openComplaints}`,
      sub: openComplaints > 0 ? 'Needs attention' : 'No pending issues',
      tag: openComplaints > 0 ? 'OPEN' : 'CLEAR',
      icon: 'CheckCircle',
      tagColor: openComplaints > 0 ? '#9333ea' : '#16a34a',
      tagBg: openComplaints > 0 ? '#faf5ff' : '#d1fae5',
    },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
      {cards.map((card, idx) => {
        const IconComponent = iconMap[card.icon]
        return (
          <Card
            key={idx}
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'box-shadow 0.3s',
              '&:hover': { boxShadow: 4 },
            }}
          >
            {/* Header with Icon and Tag */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                sx={{
                  bgcolor: card.tagBg,
                  borderRadius: 1.5,
                  p: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent sx={{ fontSize: 20, color: card.tagColor }} />
              </Box>
              <Chip
                label={card.tag}
                size="small"
                sx={{
                  color: card.tagColor,
                  bgcolor: card.tagBg,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: '22px',
                }}
              />
            </Box>

            {/* Value and Label */}
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {card.label}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
                {card.value}
              </Typography>
              {card.sub && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {card.sub}
                </Typography>
              )}
            </Box>
          </Card>
        )
      })}
    </Box>
  )
}
