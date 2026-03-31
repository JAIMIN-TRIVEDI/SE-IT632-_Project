import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import { amenities, amenityIcons } from './data'

export default function RoomDetails({ room }) {
  return (
    <Card
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          HOSTEL
        </Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
          {room?.hostelName || '—'}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          ROOM TYPE
        </Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
          {room?.roomType || 'Standard'}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          MOVE-IN DATE
        </Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
          {room?.moveInDate ? new Date(room.moveInDate).toLocaleDateString() : 'Not available'}
        </Typography>
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            letterSpacing: '0.5px',
            fontSize: '0.75rem',
          }}
        >
          AMENITIES
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {amenities.map((amenity) => {
            const IconComponent = amenityIcons[amenity.icon]
            return (
              <IconComponent
                key={amenity.icon}
                sx={{ fontSize: 16, color: 'primary.main' }}
              />
            )
          })}
        </Box>
      </Box>
    </Card>
  )
}
