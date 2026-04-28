import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material'
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded'
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded'
import { useAuth } from '../../context/AuthContext.jsx'
import LogoutButton from '../LogoutButton.jsx'

function DashboardNavbar({ mode = 'light', onToggleTheme, onProfileClick }) {
  const { user } = useAuth()
  const name = user?.name || 'User'
  const role = (user?.role || '').replace('_', ' ')
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
      {/* Theme Toggle Button */}
      <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={onToggleTheme}
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.04)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.08)',
              transform: 'scale(1.05)',
            },
          }}
        >
          {mode === 'dark' ? (
            <Brightness7RoundedIcon sx={{ fontSize: 20, color: '#ffd54f' }} />
          ) : (
            <Brightness4RoundedIcon sx={{ fontSize: 20, color: '#ff9800' }} />
          )}
        </IconButton>
      </Tooltip>

      {/* Profile Section */}
      <Box 
        onClick={onProfileClick} 
        sx={{ 
          cursor: onProfileClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.5,
          py: 0.75,
          borderRadius: 1.5,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.05)' 
              : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)' 
                : 'rgba(0,0,0,0.04)',
            transform: onProfileClick ? 'translateY(-2px)' : 'none',
          },
        }}
      >
        <Box textAlign="right">
          <Typography 
            fontSize={13} 
            fontWeight={700} 
            color="text.primary"
            sx={{ lineHeight: 1.2 }}
          >
            {name}
          </Typography>
          <Typography 
            fontSize={11} 
            color="text.secondary"
            sx={{ lineHeight: 1.2, textTransform: 'capitalize' }}
          >
            {role || 'Member'}
          </Typography>
        </Box>
        <Avatar 
          sx={{ 
            width: 38, 
            height: 38, 
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          {initials}
        </Avatar>
      </Box>

      <LogoutButton />
    </Box>
  )
}

export default DashboardNavbar
