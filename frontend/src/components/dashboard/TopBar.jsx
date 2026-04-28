import { Box, IconButton, Typography   } from '@mui/material'
import { Menu } from '@mui/icons-material'
import DashboardNavbar from './DashboardNavbar.jsx'

function TopBar({ onMobileMenuOpen, mode, onToggleTheme, onProfileClick }) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.75,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <IconButton
        onClick={onMobileMenuOpen}
        sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        aria-label="Open navigation menu"
      >
        <Menu />
      </IconButton>

      <Typography
          variant="h4"
          fontWeight={800}
          color="text.primary"
          lineHeight={1.2}
        >
          Hostel Management
        </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: 0, md: 'auto' } }}>
        <DashboardNavbar mode={mode} onToggleTheme={onToggleTheme} onProfileClick={onProfileClick} />
      </Box>
    </Box>
  )
}

export default TopBar
