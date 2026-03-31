import { Avatar, Badge, Box, IconButton, InputBase, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Notifications, Search } from '@mui/icons-material'
import LogoutButton from '../../LogoutButton.jsx'

function StudentTopBar({ activeNav = 'Dashboard', user, room }) {
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
        px: 4,
        pt: 3,
        pb: 2,
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1.2}>
          {pageInfo.title}
        </Typography>
        <Typography fontSize={13} color="text.secondary" mt={0.5}>
          {pageInfo.subtitle}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1.5} mt={0.5}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.08)
                : theme.palette.common.white,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 10,
            px: 2,
            py: 0.8,
            minWidth: 240,
          }}
        >
          <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
          <InputBase
            placeholder="Search notices, services..."
            sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
          />
        </Box>
        <IconButton
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.08)
                : theme.palette.common.white,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            width: 40,
            height: 40,
          }}
        >
          <Badge
            badgeContent={3}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}
          >
            <Notifications sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Badge>
        </IconButton>
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: 'primary.main',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {initials}
        </Avatar>
        <LogoutButton />
      </Box>
    </Box>
  )
}

export default StudentTopBar
