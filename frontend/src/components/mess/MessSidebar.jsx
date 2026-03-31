import { Box, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'

const menu = [
  "Dashboard",
  "Mess Plans",
  "Subscriptions",
  "Students",
  "Payments",
  "Attendance",
  "Menu Management",
  "Notifications",
  "Reports",
  "Settings"
]

function MessSidebar() {
  return (
    <Box sx={{
      width: 260,
      bgcolor: '#fff',
      borderRight: '1px solid #e5e7eb',
      p: 2,
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Logo */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <DashboardIcon color="primary" />
        <Typography fontWeight={700}>Hostezy</Typography>
      </Box>

      {/* Menu */}
      {menu.map((item, index) => (
        <Box
          key={index}
          sx={{
            p: 1.3,
            borderRadius: 2,
            cursor: 'pointer',
            bgcolor: item === "Dashboard" ? '#e0ecff' : 'transparent',
            color: item === "Dashboard" ? '#2563eb' : '#334155',
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          {item}
        </Box>
      ))}

      {/* Button */}
      <Box mt="auto">
        <Box sx={{
          mt: 2,
          bgcolor: '#2563eb',
          color: 'white',
          textAlign: 'center',
          py: 1.5,
          borderRadius: 3,
          cursor: 'pointer'
        }}>
          + Add Mess Plan
        </Box>
      </Box>

    </Box>
  )
}

export default MessSidebar