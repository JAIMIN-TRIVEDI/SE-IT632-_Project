import { Avatar, Box, IconButton, InputBase, Typography } from '@mui/material'
import { Help, Menu, Notifications, Search } from '@mui/icons-material'
import LogoutButton from '../LogoutButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function TopBar({ onMobileMenuOpen }) {
  const { user } = useAuth()

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.5,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <IconButton
        onClick={onMobileMenuOpen}
        sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        aria-label="Open navigation menu"
      >
        <Menu />
      </IconButton>

      <Box
        sx={{
          flex: 1,
          maxWidth: { xs: '100%', md: 420 },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : '#f8fafc'),
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 2,
          py: 0.8,
          width: { xs: '100%', md: 'auto' },
        }}
      >
        <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
        <InputBase
          placeholder="Search for students, rooms, or transactions..."
          sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
        />
      </Box>
      <Box sx={{ ml: { xs: 0, md: 'auto' }, display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <Notifications />
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <Help />
        </IconButton>
        <Box display="flex" alignItems="center" gap={1}>
          <Box textAlign="right">
            <Typography fontSize={13} fontWeight={600} color="text.primary">
              {user?.name || 'Admin User'}
            </Typography>
            <Typography fontSize={11} color="text.secondary">
              {user?.role?.replace('_', ' ') || 'Hostel Admin'}
            </Typography>
          </Box>
          <Avatar sx={{ width: 38, height: 38, bgcolor: 'action.hover' }}>
            {user?.name?.slice(0, 1) || 'A'}
          </Avatar>
        </Box>
        <LogoutButton />
      </Box>
    </Box>
  )
}

export default TopBar
