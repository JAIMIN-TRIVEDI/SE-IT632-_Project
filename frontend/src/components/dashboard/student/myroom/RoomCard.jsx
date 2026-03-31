import React from 'react'
import { Box, Typography, Chip } from '@mui/material'

export default function RoomCard({ room }) {
  const roomNumber = room?.roomNumber || 'N/A'
  const roomFloor = roomNumber?.split('-')?.[0] || 'N/A'
  const status = room?.status ? `${room.status.charAt(0).toUpperCase() + room.status.slice(1)}` : 'Assigned'

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
        height: 224,
        display: 'flex',
        alignItems: 'flex-end',
        p: 3,
      }}
    >
      <Box sx={{ color: 'white', zIndex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            opacity: 0.8,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
          }}
        >
          📍 FLOOR {roomFloor}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: '2rem',
            mt: 0.5,
          }}
        >
          Room {roomNumber}
        </Typography>
      </Box>

      <Chip
        label={`● ${status}`}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          bgcolor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          fontWeight: 600,
          fontSize: '0.75rem',
          zIndex: 1,
        }}
      />
    </Box>
  )
}
