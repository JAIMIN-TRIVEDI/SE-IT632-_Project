import { Box, IconButton, Typography } from "@mui/material";
import { LocationOn, Menu } from "@mui/icons-material";
import DashboardNavbar from '../DashboardNavbar.jsx'

function WardenTopBar({
  activeNav,
  mode = "light",
  onToggleTheme,
  searchQuery,
  onSearchChange,
  placeholder,
  onMobileMenuOpen,
}) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        pt: 3,
        pb: 2,
        bgcolor: "background.default",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <IconButton
          onClick={onMobileMenuOpen}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mb: 1, ml: -0.75 }}
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
          {activeNav === "Dashboard" ? "Operational Overview" : activeNav}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
          <LocationOn sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography fontSize={13} color="text.secondary">
            North Wing - Block A
          </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" width={{ xs: '100%', md: 'auto' }} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
        <DashboardNavbar mode={mode} onToggleTheme={onToggleTheme} />
      </Box>
    </Box>
  );
}

export default WardenTopBar;
