import { Box, Container, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import HotelRoundedIcon from '@mui/icons-material/HotelRounded'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'

const features = [
  {
    icon: <HotelRoundedIcon />,
    title: 'Room Management',
    description:
      'Handle easy check-in/out and real-time availability tracking. Visual room mapping for instant allocation.',
  },
  {
    icon: <RestaurantMenuRoundedIcon />,
    title: 'Mess Subscription',
    description:
      'Daily meal planning, QR-based attendance, and automated subscription tracking for mess facilities.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Complaint System',
    description:
      'Quick resolution of maintenance and hostel issues via digital tickets and real-time status updates.',
  },
  {
    icon: <CreditCardRoundedIcon />,
    title: 'Online Payments',
    description:
      'Secure and transparent fee payments with instant digital receipts and automatic late fee calculations.',
  },
  {
    icon: <DashboardRoundedIcon />,
    title: 'Admin Dashboard',
    description:
      'Comprehensive oversight and analytics for hostel management. Export reports for finances and occupancy.',
  },
  {
    icon: <NotificationsActiveRoundedIcon />,
    title: 'Smart Notifications',
    description:
      'Keep everyone informed with automated SMS and Email alerts for announcements and fee deadlines.',
  },
]

const FeaturesSection = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 10, md: 14 },
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(8, 12, 26, 0.9)' : '#f4f7fb',
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          top: -180,
          left: -120,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 70%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          bottom: -160,
          right: -120,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(14, 165, 233, 0) 70%)'
              : 'radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(14, 165, 233, 0) 70%)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              color="primary.main"
              sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1.5, fontSize: 13 }}
            >
              Powerful Capabilities
            </Typography>
            <Typography
              variant="h3"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 2, letterSpacing: -0.5, fontSize: { xs: '1.8rem', md: '2.3rem' } }}
            >
              Everything you need to run a modern hostel
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 540, mx: 'auto', lineHeight: 1.7 }}
            >
              Our comprehensive suite of tools ensures a smooth experience for both residents and
              administration, from room allocation to digital menus.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            {features.map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.7)' : '#f8fafc',
                  border: (theme) =>
                    theme.palette.mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.16)' : '1px solid #e5e7eb',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 14px 24px rgba(2, 6, 23, 0.35)'
                      : '0 10px 22px rgba(15, 23, 42, 0.06)',
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    '& svg': { color: 'primary.main', fontSize: 26 },
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ mb: 1.5, fontSize: '1rem' }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default FeaturesSection
