import React from 'react'
import { Box, Button, Card, Typography } from '@mui/material'
import {
  ChevronRight,
  RoomService,
  Restaurant,
  CreditCard,
  CheckCircle,
} from '@mui/icons-material'

const quickActions = [
  {
    id: 'book-mess',
    icon: 'Restaurant',
    title: 'Mess Booking',
    desc: 'View and manage your mess plan',
  },
  {
    id: 'room-services',
    icon: 'RoomService',
    title: 'Room Services',
    desc: 'Request maintenance or housekeeping',
  },
  {
    id: 'pay-fees',
    icon: 'CreditCard',
    title: 'Pay Fees',
    desc: 'Checkout pending payments',
    highlight: true,
  },
]

const iconMap = {
  RoomService: RoomService,
  Restaurant: Restaurant,
  CreditCard: CreditCard,
}

export default function StudentQuickActions() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Quick Action Buttons */}
      {quickActions.map((action) => {
        const IconComponent = iconMap[action.icon]
        return (
          <Button
            key={action.id}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              borderRadius: 2,
              textTransform: 'none',
              justifyContent: 'flex-start',
              transition: 'all 0.2s',
              ...(action.highlight
                ? {
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: 3,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      boxShadow: 4,
                    },
                  }
                : {
                    bgcolor: 'white',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      boxShadow: 1,
                    },
                  }),
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: action.highlight ? 'white' : 'primary.main',
              }}
            >
              {IconComponent && <IconComponent sx={{ fontSize: 18 }} />}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, textAlign: 'left' }}>
              <Typography variant="body2" fontWeight={600}>
                {action.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: action.highlight ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                }}
              >
                {action.desc}
              </Typography>
            </Box>

            {/* Chevron */}
            <ChevronRight
              sx={{
                fontSize: 16,
                color: action.highlight ? 'rgba(255,255,255,0.8)' : 'text.disabled',
              }}
            />
          </Button>
        )
      })}

      {/* Info Card */}
      <Card
        sx={{
          mt: 3,
          p: 2,
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '1px solid',
          borderColor: 'success.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <CheckCircle sx={{ fontSize: 20, color: 'success.dark', flexShrink: 0, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color="success.dark">
              You're all caught up!
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.dark', mt: 0.5, display: 'block' }}>
              No pending actions or urgent tasks right now.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
