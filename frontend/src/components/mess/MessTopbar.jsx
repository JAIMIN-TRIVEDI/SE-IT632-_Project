import { Box, InputBase, Avatar, IconButton, Tooltip } from '@mui/material'
import { Menu } from '@mui/icons-material'
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded'
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded'
import LogoutButton from '../LogoutButton.jsx'

function MessTopbar({ mode, onToggleTheme, onMobileMenuOpen }) {
  return (
    <Box sx={{
      p: { xs: 1.5, sm: 2 },
      bgcolor: 'background.paper',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: 'divider',
      gap: 1.5,
      flexWrap: 'wrap',
    }}>

      <IconButton
        onClick={onMobileMenuOpen}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.5 }}
        aria-label="Open navigation menu"
      >
        <Menu />
      </IconButton>

      <InputBase
        placeholder="Search for students, subscriptions..."
        sx={{
          bgcolor: 'action.hover',
          px: 2,
          py: 1,
          borderRadius: 2,
          width: { xs: '100%', sm: 'auto' },
          flex: { xs: '1 1 100%', sm: '0 1 350px' }
        }}
      />

      <Box display="flex" alignItems="center" gap={1.5} ml="auto">
        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton onClick={onToggleTheme} color="inherit">
            {mode === 'light' ? <Brightness4RoundedIcon /> : <Brightness7RoundedIcon />}
          </IconButton>
        </Tooltip>
        <Avatar />
        <LogoutButton />
      </Box>
    </Box>
  )
}

export default MessTopbar