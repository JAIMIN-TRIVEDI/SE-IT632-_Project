import React from 'react'
import { Box, Typography, Button, Card, Avatar, IconButton } from '@mui/material'
import { ChatBubble } from '@mui/icons-material'
import HighlightMatch from  '../../../../components/HighlightMatch'

export default function RoommatesSection({ roommates = [], searchQuery = '' }) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            My Roommates
          </Typography>
          <Box
            sx={{
              bgcolor: 'action.selected',
              borderRadius: 1,
              px: 1,
              py: 0.25,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {roommates.length}
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Message All
        </Button>
      </Box>

      {/* Roommates Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {roommates.map((roommate) => (
          <Card
            key={roommate.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                bgcolor: 'action.selected',
                color: 'text.primary',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                width: 40,
                height: 40,
              }}
            >
              {roommate.initials}
            </Avatar>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                <HighlightMatch text={roommate.name} query={searchQuery} />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <HighlightMatch text={roommate.department || 'Roommate'} query={searchQuery} />
              </Typography>
            </Box>

            {/* Message Icon */}
            <IconButton size="small" sx={{ color: 'primary.main' }}>
              <ChatBubble sx={{ fontSize: 16 }} />
            </IconButton>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
