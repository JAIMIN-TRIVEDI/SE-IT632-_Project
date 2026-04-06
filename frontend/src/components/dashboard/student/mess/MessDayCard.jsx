import { Box, Card, Typography, Divider } from '@mui/material'

function MessDayCard({ day, breakfast, lunch, dinner }) {
  const normalizedDay = String(day || '').trim().toLowerCase()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const isToday = normalizedDay === today
  const formattedDay = normalizedDay
    ? normalizedDay.charAt(0).toUpperCase() + normalizedDay.slice(1)
    : day

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderWidth: isToday ? 2 : 1,
        borderColor: isToday ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        backgroundImage: isToday
          ? 'linear-gradient(180deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.03) 100%)'
          : 'none',
        boxShadow: isToday ? '0 8px 24px rgba(25, 118, 210, 0.18)' : 'none',
        maxWidth: 250,
        minWidth: 250,
      }}
    >
      
      <Typography variant="h6" fontWeight={700} mb={1}>
        {formattedDay}
        {isToday && (
        <Typography
          variant="caption"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.25,
            mb: 1,
            ml: 1,
            marginBottom: 0.5,
            borderRadius: 10,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Today
        </Typography>
      )}
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
