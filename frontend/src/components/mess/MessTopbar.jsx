import { Box, InputBase, Avatar } from '@mui/material'
import LogoutButton from '../LogoutButton.jsx'

function MessTopbar() {
  return (
    <Box sx={{
      p: 2,
      bgcolor: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb'
    }}>

      <InputBase
        placeholder="Search for students, subscriptions..."
        sx={{
          bgcolor: '#f1f5f9',
          px: 2,
          py: 1,
          borderRadius: 2,
          width: 350
        }}
      />

      <Box display="flex" alignItems="center" gap={2}>
        <Avatar />
        <LogoutButton />
      </Box>
    </Box>
  )
}

export default MessTopbar