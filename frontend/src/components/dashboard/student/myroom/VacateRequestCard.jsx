import React from 'react'
import { Box, Button, Typography } from '@mui/material'

export default function VacateRequestCard() {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'rgba(239, 68, 68, 0.05)',
        p: 2.5,
        textAlign: 'center',
      }}
    >
      {/* Title */}
      <Typography variant="body2" fontWeight="bold" color="error.main">
        End your stay
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Submit a vacate request
      </Typography>

      {/* Button */}
      <Button
        variant="contained"
        color="error"
        sx={{
          mt: 2,
          borderRadius: 8,
          px: 3,
          py: 1,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
        }}
      >
        Request Vacate
      </Button>

      {/* Notice */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Standard 30-day notice applies
      </Typography>
    </Box>
  )
}
