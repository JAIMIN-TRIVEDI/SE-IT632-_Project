import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  Paper,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'

const DashboardMockup = () => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: 'grey.200',
      borderRadius: 3,
      overflow: 'hidden',
      bgcolor: 'white',
      maxWidth: 440,
      width: '100%',
    }}
  >
    <Box sx={{ bgcolor: 'grey.100', px: 2, py: 1, display: 'flex', gap: 0.7, alignItems: 'center' }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f57' }} />
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#febc2e' }} />
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28c840' }} />
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: 10 }}>
        Noticeboard Attendance
      </Typography>
    </Box>

    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          borderRadius: 1.5,
          px: 2,
          py: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: 11 }}>
          Quen Christenson
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ width: 14, height: 2, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    </Box>

    <Box sx={{ p: 2 }}>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}
      >
        Noticeboard
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, alignItems: 'flex-start' }}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.light' }} />
        <Box sx={{ flex: 1 }}>
          {['Name Event', 'Date', 'Attendance', 'Contact'].map((label, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.6, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, minWidth: 60 }}>
                {label}
              </Typography>
              <Box
                sx={{
                  height: 6,
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  width: i === 0 ? 80 : i === 1 ? 50 : i === 2 ? 65 : 55,
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 1, width: '70%', mb: 1 }} />
        <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 1, width: '50%' }} />
      </Box>
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Box sx={{ bgcolor: '#10b981', borderRadius: 2, px: 1.5, py: 0.4 }}>
          <Typography sx={{ color: 'white', fontSize: 9, fontWeight: 600 }}>Present</Typography>
        </Box>
        <Box sx={{ bgcolor: 'grey.200', borderRadius: 2, px: 1.5, py: 0.4 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 9, fontWeight: 600 }}>
            Absent
          </Typography>
        </Box>
      </Box>
    </Box>
  </Paper>
)

const HeroSection = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 6,
            alignItems: 'center',
          }}
        >
          <Box>
            <Chip
              label="New: Automated Mess Billing"
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
                color: 'primary.main',
                fontWeight: 600,
                fontSize: 12,
                mb: 3,
                borderRadius: 2,
              }}
            />
            <Typography
              variant="h2"
              fontWeight={900}
              color="text.primary"
              sx={{
                lineHeight: 1.15,
                letterSpacing: -1,
                mb: 2.5,
                fontSize: { xs: '2.5rem', md: '3.2rem' },
                textShadow: '0 0 0.5px rgba(15, 23, 42, 0.35)',
              }}
            >
              Streamline Your{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                Hostel &amp; Mess
              </Box>{' '}
              Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7, maxWidth: 420 }}>
              The all-in-one platform for students and admins to manage rooms, meals, and payments
              seamlessly. Increase efficiency by up to 40%.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'primary.main',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: 15,
                  boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                  '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 6px 24px rgba(37,99,235,0.45)' },
                }}
              >
                Get Started Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                sx={{
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: 15,
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                }}
              >
                Watch Demo
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AvatarGroup
                max={3}
                sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 12, border: '2px solid white' } }}
              >
                <Avatar sx={{ bgcolor: '#f59e0b' }}>S</Avatar>
                <Avatar sx={{ bgcolor: '#10b981' }}>A</Avatar>
                <Avatar sx={{ bgcolor: '#8b5cf6' }}>M</Avatar>
              </AvatarGroup>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Trusted by{' '}
                <Box component="span" fontWeight={700} color="text.primary">
                  500+
                </Box>{' '}
                Hostel Admins
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <DashboardMockup />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default HeroSection
