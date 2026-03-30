import { Box, Typography } from '@mui/material'

function SectionTitle({ overline, title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
      {overline ? (
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.22em' }}
        >
          {overline}
        </Typography>
      ) : null}
      <Typography variant="h2" sx={{ mt: 1.5, fontWeight: 800 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body1"
          sx={{ mt: 2, color: 'text.secondary', maxWidth: 720, mx: 'auto' }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  )
}

export default SectionTitle
