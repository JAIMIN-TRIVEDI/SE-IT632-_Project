import { Box, InputBase, Avatar, IconButton, Tooltip } from '@mui/material'
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded'
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded'
import LogoutButton from '../LogoutButton.jsx'

function MessTopbar({ mode, onToggleTheme }) {
  return (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>

      <InputBase
        placeholder="Search for students, subscriptions..."
        sx={{
          bgcolor: 'action.hover',
          px: 2,
          py: 1,
          borderRadius: 2,
          width: 350
        }}
      />

      <Box display="flex" alignItems="center" gap={2}>
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