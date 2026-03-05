import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { roomPolicies } from './data'

export default function RoomPoliciesCard() {
  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        p: 2.5,
      }}
    >
      {/* Title */}
      <Typography variant="body2" fontWeight="bold">
        🏠 Room Policies
      </Typography>

      {/* Policies List */}
      <Box component="ul" sx={{ mt: 2, pl: 0, listStyle: 'none', '& li': { mb: 1 } }}>
        {roomPolicies.map((policy, idx) => (
          <Typography
            key={idx}
            component="li"
            variant="body2"
            sx={{ fontSize: '0.875rem' }}
          >
            ✅ {policy}
          </Typography>
        ))}
      </Box>

      {/* Button */}
      <Button
        fullWidth
        variant="contained"
        sx={{
          mt: 2,
          bgcolor: 'primary.contrastText',
          color: 'primary.main',
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          py: 1,
          '&:hover': {
            bgcolor: 'background.paper',
          },
        }}
      >
        View All Rules
      </Button>
    </Box>
  )
}
