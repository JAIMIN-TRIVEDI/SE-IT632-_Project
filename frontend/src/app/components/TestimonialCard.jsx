import { Avatar, Box, Paper, Rating, Typography } from '@mui/material'

function TestimonialCard({ quote, name, role, avatar }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        height: '100%',
      }}
    >
      <Rating value={5} readOnly size="small" sx={{ mb: 2 }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        “{quote}”
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={avatar} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {role}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default TestimonialCard
