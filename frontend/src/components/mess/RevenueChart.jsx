import { Box, Typography } from '@mui/material'

function RevenueChart() {
  return (
    <Box sx={{
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(248, 250, 252, 0.95)',
      p: 2,
      borderRadius: 3,
      height: 260,
      border: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
      boxShadow: (theme) =>
        theme.palette.mode === 'dark'
          ? '0 10px 30px rgba(2, 6, 23, 0.38)'
          : '0 10px 25px rgba(15, 23, 42, 0.08)'
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
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.22)' : '#e2e8f0',
        borderRadius: 2
      }} />
    </Box>
  )
}

export default RevenueChart