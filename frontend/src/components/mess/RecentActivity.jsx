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
      bgcolor: '#fff',
      p: 2,
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
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