import { Box, Typography } from '@mui/material'

function MessComingSoon({ title }) {
  return (
    <Box sx={{ minHeight: '100%' }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
        This section is coming soon. The mess admin feature pathway is being built one piece at a time. Check back later for subscription management, student tools, payments, attendance, menu updates, notifications, and reports.
      </Typography>
    </Box>
  )
}

export default MessComingSoon
