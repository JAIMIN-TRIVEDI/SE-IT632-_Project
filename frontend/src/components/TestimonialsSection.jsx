import { Box, Container, Typography, Paper, Avatar, Rating } from '@mui/material'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Hostel Administrator',
    rating: 5,
    text: '"Hostezy completely changed how we manage our 300-student hostel. The mess tracking alone saved us 20% on food waste last semester."',
    initial: 'S',
    color: '#f59e0b',
  },
  {
    name: 'Alex Rodriguez',
    role: 'Graduate Student',
    rating: 4.5,
    text: '"Paying fees and raising maintenance complaints has never been easier. I can do everything from the app without visiting the office."',
    initial: 'A',
    color: '#10b981',
  },
  {
    name: 'David Wilson',
    role: 'Property Manager',
    rating: 5,
    text: '"The transparency is amazing. No more disputes about attendance or pending payments. Highly recommended for any hostel owner."',
    initial: 'D',
    color: '#3b82f6',
  },
]

const TestimonialsSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          fontWeight={800}
          color="text.primary"
          textAlign="center"
          sx={{ mb: 6, letterSpacing: -0.5, fontSize: { xs: '1.8rem', md: '2.2rem' } }}
        >
          Trusted by Students & Admins
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {testimonials.map((t) => (
            <Paper
              key={t.name}
              elevation={0}
              sx={{
                p: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
              <Box>
                <Rating
                  value={t.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ mb: 2, '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.75, fontStyle: 'italic' }}
                >
                  {t.text}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: t.color, width: 40, height: 40, fontWeight: 700 }}>
                  {t.initial}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {t.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.role}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default TestimonialsSection
