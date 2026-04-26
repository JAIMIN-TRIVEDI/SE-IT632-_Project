import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import MessSidebar from '../components/mess/MessSidebar'
import MessTopbar from '../components/mess/MessTopbar'
import { useLocation } from 'react-router-dom'

function MessAdminLayout({ mode, onToggleTheme }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <MessSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MessTopbar mode={mode} onToggleTheme={onToggleTheme} onMobileMenuOpen={() => setMobileNavOpen(true)} />
        <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MessAdminLayout
