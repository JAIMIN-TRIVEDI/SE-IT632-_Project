import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha } from "@mui/material/styles";
import { LogoutOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { navItems } from "./data";
import { useAuth } from "../../../context/AuthContext.jsx";
import BrandImage from "../../BrandImage.jsx";

const DRAWER_WIDTH = 240;

function StudentSidebarNav({ activeNav, onSelect, user, mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const userName = user?.name || "Student";
  const userRole = user?.role
    ? String(user.role).replace(/_/g, " ")
    : "Student";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? 280 : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? 280 : DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate("/")}
        sx={{
          px: 2.5,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
        }}
      >
        <Box>
          <BrandImage width={200} />
          <Typography
            fontSize={10}
            color="text.secondary"
            letterSpacing={1}
            textTransform="uppercase"
          >
            Student Portal
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Nav */}
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.label;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => onSelect(item.label)}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.9,
                  bgcolor: (theme) =>
                    isActive
                      ? alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.22 : 0.1,
                        )
                      : "transparent",
                  color: (theme) =>
                    isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === "dark" ? 0.2 : 0.07,
                      ),
                  },
                  "& .MuiListItemIcon-root": {
                    color: (theme) =>
                      isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    minWidth: 36,
                  },
                }}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge
                      badgeContent={item.badge}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: 10,
                          height: 16,
                          minWidth: 16,
                        },
                      }}
                    >
                      <Icon fontSize="small" />
                    </Badge>
                  ) : (
                    <Icon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom: user + logout */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              fontSize={13}
              fontWeight={700}
              color="text.primary"
              noWrap
            >
              {userName}
            </Typography>
            <Typography
              fontSize={11}
              color="text.secondary"
              textTransform="capitalize"
            >
              {userRole}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<LogoutOutlined fontSize="small" />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            color: "text.secondary",
            borderColor: "divider",
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}

export default StudentSidebarNav;
