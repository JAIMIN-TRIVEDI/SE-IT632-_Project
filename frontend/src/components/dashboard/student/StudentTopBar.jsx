import { IconButton, Typography, Box } from '@mui/material'
import { Menu } from '@mui/icons-material'
import DashboardNavbar from '../DashboardNavbar.jsx'

function StudentTopBar({
  activeNav = 'Dashboard',
  user,
  room,
  mode = 'light',
  onToggleTheme,
  searchQuery = '',
  searchPlaceholder = 'Search... ',
  onSearchChange,
  onProfileClick,
  onMobileMenuOpen,
}) {
  const userName = user?.name || 'Student'
  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const getPageInfo = () => {
    switch (activeNav) {
      case 'My Room':
        return {
          title: 'My Room',
          subtitle: room?.roomNumber
            ? `${room.roomNumber} · ${room.hostelName || 'Hostel'} · ${room.hostelType || ''}`
            : 'Your assigned room details',
        }
      case 'Payments':
        return {
          title: 'Payments & Fees',
          subtitle: 'Manage your payment history and upcoming dues',
        }
      case 'Mess Menu':
        return {
          title: 'Mess Menu',
          subtitle: 'Weekly meal schedule and dietary preferences',
        }
      case 'Attendance':
        return {
          title: 'Attendance',
          subtitle: 'Track your hostel attendance and leaves',
        }
      case 'Notices':
        return {
          title: 'Notices & Announcements',
          subtitle: 'Stay updated with hostel notifications',
        }
      case 'Profile':
        return {
          title: 'My Profile',
          subtitle: 'Manage your personal information and settings',
        }
      default:
        return {
          title: 'Student Dashboard',
          subtitle: `Welcome back, ${userName}`,
        }
    }
  }

  const pageInfo = getPageInfo()
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        pt: 3,
        pb: 2,
        bgcolor: 'background.default',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <IconButton
          onClick={onMobileMenuOpen}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mb: 1, ml: -0.75 }}
          aria-label="Open navigation menu"
        >
          <Menu />
        </IconButton>
        <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1.2}>
          {pageInfo.title}
        </Typography>
        <Typography fontSize={13} color="text.secondary" mt={0.5}>
          {pageInfo.subtitle}
        </Typography>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        mt={0.5}
        flexWrap="wrap"
        justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
        width={{ xs: '100%', md: 'auto' }}
      >
        <DashboardNavbar mode={mode} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      </Box>
    </Box>
  )
}

export default StudentTopBar
