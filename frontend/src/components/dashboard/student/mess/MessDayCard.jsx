import { Box, Card, Typography, Divider } from '@mui/material'

function MessDayCard({ day, breakfast, lunch, dinner }) {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={1}>
        {day}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight={700} fontSize={13} color="text.secondary">
          Breakfast
        </Typography>
        <Typography fontSize={15} color="text.primary">
          {breakfast || 'No menu available'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight={700} fontSize={13} color="text.secondary">
          Lunch
        </Typography>
        <Typography fontSize={15} color="text.primary">
          {lunch || 'No menu available'}
        </Typography>
      </Box>

      <Box>
        <Typography fontWeight={700} fontSize={13} color="text.secondary">
          Dinner
        </Typography>
        <Typography fontSize={15} color="text.primary">
          {dinner || 'No menu available'}
        </Typography>
      </Box>
    </Card>
  )
}

export default MessDayCard
