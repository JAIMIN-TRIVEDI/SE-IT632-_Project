import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import MessSidebar from '../components/mess/MessSidebar'
import MessTopbar from '../components/mess/MessTopbar'

function MessAdminLayout({ mode, onToggleTheme }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <MessSidebar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MessTopbar mode={mode} onToggleTheme={onToggleTheme} />
        <Box sx={{ p: 3, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MessAdminLayout
