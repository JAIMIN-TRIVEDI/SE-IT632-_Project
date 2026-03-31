import { Box, Typography } from '@mui/material'

function StatCard({ title, value, change, warning }) {
  return (
    <Box sx={{
      flex: 1,
      bgcolor: '#fff',
      p: 2,
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
    }}>
      <Typography fontSize={13} color="text.secondary">
        {title}
      </Typography>

      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>

      <Typography
        fontSize={12}
        color={warning ? 'orange' : change.includes('-') ? 'red' : 'green'}
      >
        {change}
      </Typography>
    </Box>
  )
}

export default StatCard