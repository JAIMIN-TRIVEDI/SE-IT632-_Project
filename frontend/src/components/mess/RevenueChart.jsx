import { Box, Typography } from '@mui/material'

function RevenueChart() {
  return (
    <Box sx={{
      bgcolor: '#fff',
      p: 2,
      borderRadius: 3,
      height: 260,
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
    }}>
      <Typography fontWeight={600}>
        Revenue Overview
      </Typography>

      <Typography fontSize={12} color="text.secondary" mb={1}>
        Total earnings over the last 30 days
      </Typography>

      {/* Fake chart */}
      <Box sx={{
        height: '70%',
        bgcolor: '#e2e8f0',
        borderRadius: 2
      }} />
    </Box>
  )
}

export default RevenueChart