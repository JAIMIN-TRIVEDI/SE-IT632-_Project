import { Box, IconButton, InputBase, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LocationOn, Menu, Search, Tune } from "@mui/icons-material";
import Brightness4RoundedIcon from "@mui/icons-material/Brightness4Rounded";
import Brightness7RoundedIcon from "@mui/icons-material/Brightness7Rounded";
import Tooltip from "@mui/material/Tooltip";
import LogoutButton from "../../LogoutButton.jsx";

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
      <Box display="flex" alignItems="center" gap={1.25} flexWrap="wrap" width={{ xs: '100%', md: 'auto' }} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.08)
                : theme.palette.common.white,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 10,
            px: 2,
            py: 0.8,
            minWidth: { xs: '100%', sm: 280 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Search sx={{ color: "text.secondary", fontSize: 18 }} />
          <InputBase
            placeholder={placeholder || "Search student or room..."}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{ fontSize: 13, color: "text.secondary", flex: 1 }}
          />
        </Box>
        <IconButton
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.08)
                : theme.palette.common.white,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            width: 40,
            height: 40,
          }}
        >
          <Tune sx={{ fontSize: 18, color: "text.secondary" }} />
        </IconButton>
        <Tooltip
          title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
        >
          <IconButton
            onClick={onToggleTheme}
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.08)
                  : theme.palette.common.white,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              width: 40,
              height: 40,
            }}
          >
            {mode === "light" ? (
              <Brightness4RoundedIcon
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
            ) : (
              <Brightness7RoundedIcon
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
            )}
          </IconButton>
        </Tooltip>
        <LogoutButton />
      </Box>
    </Box>
  );
}

export default WardenTopBar;
