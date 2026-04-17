import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import { alpha } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FooterSection from '../components/FooterSection.jsx'

const values = [
  {
    title: 'Speed-First Operations',
    icon: <BoltRoundedIcon fontSize="small" />,
    description: 'From room requests to billing workflows, we reduce repetitive admin steps and deliver instant actions.',
  },
  {
    title: 'Student-Centered Experience',
    icon: <GroupsRoundedIcon fontSize="small" />,
    description: 'Everything is designed around clarity for students, wardens, and admins on every screen size.',
  },
  {
    title: 'Secure by Design',
    icon: <SecurityRoundedIcon fontSize="small" />,
    description: 'Role-based access, payment-ready modules, and transparent records to keep data protected and trusted.',
  },
  {
    title: 'Data-Driven Growth',
    icon: <InsightsRoundedIcon fontSize="small" />,
    description: 'Analytics surfaces occupancy, mess usage, and payment behavior so your next decision is evidence-based.',
  },
]

const stats = [
  { label: 'Hostels Onboarded', value: '180+' },
  { label: 'Students Served', value: '42K+' },
  { label: 'Avg. Admin Time Saved', value: '38%' },
]

function AboutPage({ mode, onToggleTheme }) {
  const navigate = useNavigate()

  return (
    <>
      <Box
        sx={{
          '@keyframes pulseAura': {
            '0%': { opacity: 0.45, transform: 'scale(0.9)' },
            '50%': { opacity: 0.9, transform: 'scale(1.08)' },
            '100%': { opacity: 0.45, transform: 'scale(0.9)' },
          },
          '@keyframes drift': {
            '0%': { transform: 'translate3d(0, 0, 0)' },
            '50%': { transform: 'translate3d(0, -20px, 0)' },
            '100%': { transform: 'translate3d(0, 0, 0)' },
          },
          '@keyframes riseIn': {
            '0%': { opacity: 0, transform: 'translateY(34px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Header mode={mode} onToggleTheme={onToggleTheme} />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: { xs: 240, md: 420 },
              height: { xs: 240, md: 420 },
              borderRadius: '50%',
              top: { xs: -90, md: -140 },
              left: { xs: -70, md: -120 },
              background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0) 70%)',
              filter: 'blur(6px)',
              animation: 'pulseAura 8s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: { xs: 240, md: 440 },
              height: { xs: 240, md: 440 },
              borderRadius: '50%',
              bottom: { xs: -130, md: -180 },
              right: { xs: -90, md: -130 },
              background: 'radial-gradient(circle, rgba(16,185,129,0.42) 0%, rgba(16,185,129,0) 72%)',
              filter: 'blur(8px)',
              animation: 'pulseAura 10s ease-in-out infinite',
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
          <Stack spacing={4} sx={{ maxWidth: 860, animation: 'riseIn 0.9s ease forwards' }}>
            <Chip
              label="About Hostezy"
              sx={{
                alignSelf: 'flex-start',
                px: 1,
                fontWeight: 700,
                color: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: -1.2,
                lineHeight: 1.08,
                fontSize: { xs: '2.15rem', md: '3.7rem' },
              }}
            >
              Building the most
              <Box
                component="span"
                sx={{
                  ml: 1,
                  backgroundImage:
                    'linear-gradient(120deg, #0ea5e9 0%, #2563eb 35%, #22c55e 68%, #f97316 100%)',
                  backgroundSize: '240% 240%',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'shimmer 6s ease infinite',
                }}
              >
                alive campus operations platform
              </Box>
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ lineHeight: 1.8, maxWidth: 740, fontWeight: 400, fontSize: { xs: '1rem', md: '1.12rem' } }}
            >
              Hostezy started with one mission: remove operational friction from hostel and mess management.
              We blend automation, transparency, and modern design so every stakeholder can move faster with confidence.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  px: 3.2,
                  py: 1.3,
                  borderRadius: 2.4,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: '0 14px 30px rgba(37, 99, 235, 0.32)',
                }}
                onClick={() => navigate('/register')}
              >
                Join the Platform
              </Button>
              <Button
                variant="outlined"
                sx={{
                  alignSelf: 'flex-start',
                  px: 3,
                  py: 1.3,
                  borderRadius: 2.4,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
                onClick={() => navigate('/#features')}
              >
                Explore Features
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              mt: { xs: 6, md: 9 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
              gap: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                p: { xs: 2.6, md: 3.4 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.84)',
                backdropFilter: 'blur(8px)',
                animation: 'riseIn 1s ease forwards',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: -60,
                  top: -60,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(14,165,233,0.28) 0%, rgba(14,165,233,0) 72%)',
                  animation: 'drift 7s ease-in-out infinite',
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
                Why Teams Choose Hostezy
              </Typography>
              <Stack spacing={2}>
                {values.map((value, index) => (
                  <Box
                    key={value.title}
                    sx={{
                      p: 2,
                      borderRadius: 2.6,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.65),
                      display: 'flex',
                      gap: 1.4,
                      alignItems: 'flex-start',
                      animation: 'riseIn 0.6s ease forwards',
                      animationDelay: `${index * 140}ms`,
                      opacity: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.8,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                        color: 'primary.main',
                        flexShrink: 0,
                        mt: 0.4,
                      }}
                    >
                      {value.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.6 }}>{value.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                        {value.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Stack spacing={3}>
              {stats.map((stat, index) => (
                <Paper
                  key={stat.label}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3.2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.9)',
                    animation: 'riseIn 0.8s ease forwards',
                    animationDelay: `${index * 180 + 120}ms`,
                    opacity: 0,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      mb: 0.7,
                      backgroundImage: 'linear-gradient(120deg, #0ea5e9, #2563eb)',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Container>

        <FooterSection />
      </Box>
    </>
  )
}

export default AboutPage
