import React from 'react'
import { Box, Card, Typography, Button } from '@mui/material'
import {
  Notifications,
  ChevronRight,
  Restaurant,
  Checkroom,
  Warning,
} from '@mui/icons-material'

const iconMap = {
  Restaurant: Restaurant,
  Checkroom: Checkroom,
  Warning: Warning,
}

export default function StudentRecentNotifications({ notifications = [] }) {
  const displayNotifications = notifications.map((notif) => ({
    id: notif._id || notif.id,
    title: notif.type ? notif.type.replace(/_/g, ' ') : 'Notification',
    desc: notif.message || notif.desc,
    time: notif.createdAt ? new Date(notif.createdAt).toLocaleString() : notif.time || '',
    icon: notif.type === 'warning' ? 'Warning' : notif.type === 'mess' ? 'Restaurant' : 'Checkroom',
    color: notif.type === 'warning' ? '#dc2626' : '#2563eb',
  }))

  return (
    <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notifications sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Recent Notifications
          </Typography>
        </Box>
        <Button
          size="small"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'none',
            minWidth: 'auto',
            p: 0,
          }}
        >
          Mark all as read
        </Button>
      </Box>

      {/* Notifications List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {displayNotifications.length === 0 ? (
          <Typography color="text.secondary">No recent notifications.</Typography>
        ) : (
          displayNotifications.map((notif, idx) => {
            const IconComponent = iconMap[notif.icon]
            return (
              <Box
                key={notif.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  pb: 2,
                  borderBottom: idx < displayNotifications.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  px: 1,
                  py: 1,
                  borderRadius: 1,
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {/* Icon */}
                <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                  {IconComponent && <IconComponent sx={{ fontSize: 18, color: notif.color }} />}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {notif.desc}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {notif.time}
                  </Typography>
                </Box>

                {/* Chevron */}
                <ChevronRight sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0, mt: 0.5 }} />
              </Box>
            )
          })
        )}
      </Box>

      {/* View All Button */}
      <Button
        fullWidth
        variant="outlined"
        sx={{
          mt: 3,
          py: 1,
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
        }}
      >
        View All Notifications
      </Button>
    </Card>
  )
}
