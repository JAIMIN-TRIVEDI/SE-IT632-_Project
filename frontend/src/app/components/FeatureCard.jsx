import { Box, Typography } from '@mui/material'

function FeatureCard({ icon, title, description }) {
  return (
    <Box
      sx={{
        height: '100%',
        p: 3.5,
        borderRadius: 4,
        bgcolor: '#fff',
        border: '1px solid #edf2f7',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <Box
        sx={{
          width: 54,
          height: 54,
          borderRadius: 3.5,
          bgcolor: '#eef4ff',
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          mb: 2.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
        {description}
      </Typography>
    </Box>
  )
}

export default FeatureCard
