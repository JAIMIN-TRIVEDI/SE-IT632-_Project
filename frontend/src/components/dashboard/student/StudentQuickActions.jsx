import React from 'react'
import { Box, Button, Card, Typography } from '@mui/material'
import {
  ChevronRight,
  RoomService,
  Restaurant,
  CreditCard,
  CheckCircle,
} from '@mui/icons-material'
import HighlightMatch from '../../HighlightMatch.jsx'

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

export default function StudentQuickActions({ searchQuery = '', onActionSelect }) {
  const actionTargets = {
    'book-mess': 'Mess Subscription',
    'room-services': 'Complaints',
    'pay-fees': 'Payments',
  }

  const filteredActions = searchQuery.trim()
    ? quickActions.filter((action) => {
      const q = searchQuery.toLowerCase()
      return action.title.toLowerCase().includes(q) || action.desc.toLowerCase().includes(q)
    })
    : quickActions

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Quick Action Buttons */}
      {filteredActions.map((action) => {
        const IconComponent = iconMap[action.icon]
        return (
          <Button
            key={action.id}
            onClick={() => onActionSelect?.(actionTargets[action.id])}
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
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 1,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(47, 97, 255, 0.08)' : 'background.paper',
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
                <HighlightMatch text={action.title} query={searchQuery} />
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: action.highlight ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                }}
              >
                <HighlightMatch text={action.desc} query={searchQuery} />
              </Typography>
            </Box>

            {/* Chevron */}
            <ChevronRight
              sx={{
                fontSize: 16,
                color: action.highlight ? 'rgba(255,255,255,0.8)' : 'text.secondary',
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
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.96) 100%)'
            : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.22)' : 'success.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <CheckCircle sx={{ fontSize: 20, color: (theme) => theme.palette.mode === 'dark' ? 'success.light' : 'success.dark', flexShrink: 0, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              You're all caught up!
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              No pending actions or urgent tasks right now.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
