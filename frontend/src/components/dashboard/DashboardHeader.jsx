import { Box, Typography } from '@mui/material'

function DashboardHeader() {
  return (
    <Box mb={3}>
      <Typography variant="h5" fontWeight={800} color="text.primary">
        Dashboard Overview
      </Typography>
      <Typography fontSize={14} color="text.secondary">
        Welcome back! Here's what's happening across your hostel network today.
      </Typography>
    </Box>
  )
}

export default DashboardHeader
