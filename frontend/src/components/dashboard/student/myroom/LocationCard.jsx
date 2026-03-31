import React from 'react'
import { Box, Card, Typography } from '@mui/material'

export default function LocationCard({ room }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        p: 2.5,
      }}
    >
      {/* Title */}
      <Typography variant="body2" fontWeight="bold">
        Location
      </Typography>

      {/* Map Placeholder */}
      <Box
        sx={{
          mt: 2,
          height: 128,
          borderRadius: 2,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: '2rem' }}>📍</Typography>
      </Box>

      {/* Address */}
      <Typography variant="body2" fontWeight={600} sx={{ mt: 2 }}>
        {room?.hostelName ? `${room.hostelName} (${room.roomNumber || 'Room'})` : 'No location available'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {room?.hostelType ? `${room.hostelType} hostel` : 'Room details are not available yet'}
      </Typography>
    </Card>
  )
}
