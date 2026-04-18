import { Box, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useLocation, useNavigate } from 'react-router-dom'
import BrandImage from '../BrandImage.jsx'

const menu = [
  { label: 'Dashboard', route: '/mess-admin/dashboard' },
  { label: 'Mess Plans', route: '/mess-admin/plans' },
  { label: 'Records', route: '/mess-admin/records' },
  { label: 'Menu Management', route: '/mess-admin/menu' },
  { label: 'Notifications', route: '/mess-admin/notifications' },
  { label: 'Reports', route: '/mess-admin/reports' },
  { label: 'Profile', route: '/mess-admin/profile' },
]

function MessSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{
      width: 260,
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
      p: 2,
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Logo */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <DashboardIcon color="primary" />
        <BrandImage width={190} />
      </Box>

      {/* Menu */}
      {menu.map((item) => {
        const isActive =
          location.pathname === item.route ||
          (item.route === '/mess-admin/dashboard' && location.pathname === '/mess-admin')
        return (
          <Box
            key={item.route}
            onClick={() => navigate(item.route)}
            sx={{
              p: 1.3,
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'primary.contrastText' : 'text.primary',
              '&:hover': { bgcolor: isActive ? 'primary.dark' : 'action.hover' }
            }}
          >
            {item.label}
          </Box>
        )
      })}

      {/* Button */}
      <Box mt="auto">
        <Box
          onClick={() => navigate('/mess-admin/plans')}
          sx={{
            mt: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            textAlign: 'center',
            py: 1.5,
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              bgcolor: 'primary.dark',
            },
          }}
        >
          + Add Mess Plan
        </Box>
      </Box>

    </Box>
  )
}

export default MessSidebar