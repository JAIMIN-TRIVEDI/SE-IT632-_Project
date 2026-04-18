import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { DRAWER_WIDTH } from '../../constants/constants'
import { navItems } from '../../constants/data'
import BrandImage from '../BrandImage.jsx'

function SidebarNav({ activeNav, onSelect }) {
  const navigate = useNavigate()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: (theme) => theme.palette.background.paper,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <Box>
          <BrandImage width={200} />
          <Typography fontSize={11} color="text.secondary">
            Hostel Admin
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onSelect(item.label)}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  bgcolor: (theme) =>
                    activeNav === item.label
                      ? theme.palette.primary.main
                      : 'transparent',
                  color: (theme) =>
                    activeNav === item.label ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: (theme) =>
                      activeNav === item.label
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
                    color: (theme) =>
                      activeNav === item.label
                        ? theme.palette.primary.contrastText
                        : theme.palette.primary.main,
                  },
                  '& .MuiListItemIcon-root': {
                    color: (theme) =>
                      activeNav === item.label ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                    minWidth: 36,
                  },
                }}
              >
                <ListItemIcon>
                  <Icon />
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
          )
        })}
      </List>
    </Drawer>
  )
}

export default SidebarNav
