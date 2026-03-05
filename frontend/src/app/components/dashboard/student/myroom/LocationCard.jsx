import React from 'react'
import { Box, Card, Typography } from '@mui/material'
import { roomInfo } from './data'

export default function LocationCard() {
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
        {roomInfo.location.address}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {roomInfo.location.nearby}
      </Typography>
    </Card>
  )
}
