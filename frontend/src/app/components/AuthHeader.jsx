import { Box, Container, Typography, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function AuthHeader() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 2,
        minHeight: { xs: '64px', sm: '72px' },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #2f61ff 0%, #1e40af 100%)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              H
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Hostezy
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              component="button"
              onClick={(e) => {
                e.preventDefault()
                // Handle support
              }}
              underline="none"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              Need help?
            </Link>
            <Link
              component="button"
              onClick={(e) => {
                e.preventDefault()
                // Handle support
              }}
              underline="none"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              Support
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default AuthHeader
