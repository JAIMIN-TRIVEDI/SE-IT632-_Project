import {
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
  Badge,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha } from "@mui/material/styles";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DRAWER_WIDTH } from "../../../constants/constants";
import { navItems } from "./data";
import BrandImage from "../../BrandImage.jsx";

function WardenSidebarNav({ activeNav, onSelect, mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

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
          bgcolor: (theme) => theme.palette.background.paper,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <Box>
          <BrandImage width={200} />
          <Typography
            fontSize={10}
            color="text.secondary"
            letterSpacing={1}
            textTransform="uppercase"
            sx={{ fontWeight: 700 }}
          >
            MANAGEMENT
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onSelect(item.label)}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  pl: 2,
                  borderLeft: (theme) =>
                    activeNav === item.label
                      ? `4px solid ${theme.palette.primary.main}`
                      : "4px solid transparent",
                  bgcolor: (theme) =>
                    activeNav === item.label
                      ? alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.24 : 0.12,
                        )
                      : "transparent",
                  color: (theme) =>
                    activeNav === item.label
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: (theme) =>
                      activeNav === item.label
                        ? alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === "dark" ? 0.28 : 0.16,
                          )
                        : alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === "dark" ? 0.2 : 0.08,
                          ),
                  },
                  "& .MuiListItemIcon-root": {
                    color: (theme) =>
                      activeNav === item.label
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
                    fontSize: 14,
                    fontWeight: activeNav === item.label ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {/* <Box sx={{ px: 2, pb: 3 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Add />}
          sx={{
            bgcolor: 'primary.main',
            borderRadius: 3,
            py: 1.3,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
          }}
        >
          Quick Check-in
        </Button>
      </Box> */}
    </Drawer>
  );
}

export default WardenSidebarNav;
