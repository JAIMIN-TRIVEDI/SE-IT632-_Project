import { Box, Typography } from '@mui/material'

function StatCard({ title, value, change, warning }) {
  return (
    <Box sx={{
      flex: 1,
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