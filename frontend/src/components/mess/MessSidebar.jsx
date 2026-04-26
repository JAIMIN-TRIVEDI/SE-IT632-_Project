import { Box, Drawer, Typography } from '@mui/material'
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import useMediaQuery from '@mui/material/useMediaQuery'
import BrandImage from "../BrandImage.jsx";

const menu = [
  {
    label: "Dashboard",
    route: "/mess-admin/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "Mess Plans",
    route: "/mess-admin/plans",
    icon: ReceiptLongOutlinedIcon,
  },
  { label: "Records", route: "/mess-admin/records", icon: MenuBookOutlinedIcon },
  {
    label: "Menu Management",
    route: "/mess-admin/menu",
    icon: RestaurantMenuOutlinedIcon,
  },
  {
    label: "Notifications",
    route: "/mess-admin/notifications",
    icon: NotificationsNoneOutlinedIcon,
  },
  {
    label: "Reports",
    route: "/mess-admin/reports",
    icon: AssessmentOutlinedIcon,
  },
  { label: "Profile", route: "/mess-admin/profile", icon: PersonOutlineOutlinedIcon },
];

function MessSidebar({ mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? 280 : 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? 280 : 260,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <DashboardIcon color="primary" />
        <BrandImage width={190} />
      </Box>

      {/* Menu */}
      {menu.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.route ||
          (item.route === "/mess-admin/dashboard" &&
            location.pathname === "/mess-admin");
        return (
          <Box
            key={item.route}
            onClick={() => navigate(item.route)}
            sx={{
              p: 1.3,
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              borderRadius: 2,
              cursor: "pointer",
              bgcolor: isActive ? "primary.main" : "transparent",
              color: isActive ? "primary.contrastText" : "text.primary",
              "&:hover": {
                bgcolor: isActive ? "primary.dark" : "action.hover",
              },
            }}
          >
            <Icon fontSize="small" />
            <Box component="span">{item.label}</Box>
          </Box>
        );
      })}

      {/* Button */}
      <Box mt="auto">
        <Box
          onClick={() => navigate("/mess-admin/plans")}
          sx={{
            mt: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            textAlign: "center",
            py: 1.5,
            borderRadius: 3,
            cursor: "pointer",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              bgcolor: "primary.dark",
            },
          }}
        >
          + Add Mess Plan
        </Box>
      </Box>
    </Drawer>
  );
}

export default MessSidebar;
