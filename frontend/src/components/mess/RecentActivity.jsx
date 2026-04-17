import { Box, Typography } from '@mui/material'

function RecentActivity() {
  const data = [
    "New Subscription - Rahul Sharma",
    "Payment Received ₹1500",
    "Subscription Expired - John Doe",
    "Attendance Marked"
  ]

  return (
    <Box sx={{
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(248, 250, 252, 0.95)',
      p: 2,
      borderRadius: 3,
      border: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
      boxShadow: (theme) =>
        theme.palette.mode === 'dark'
          ? '0 10px 30px rgba(2, 6, 23, 0.38)'
          : '0 10px 25px rgba(15, 23, 42, 0.08)'
    }}>
      <Typography fontWeight={600} mb={2}>
        Recent Activity
      </Typography>

      {data.map((item, i) => (
        <Typography key={i} fontSize={13} mb={1}>
          {item}
        </Typography>
      ))}
    </Box>
  )
}

export default RecentActivity