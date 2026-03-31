import { Avatar, Badge, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { navItems } from './data'

const DRAWER_WIDTH = 240

function StudentSidebarNav({ activeNav, onSelect, user }) {
  const navigate = useNavigate()

  const userName = user?.name || 'Student'
  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate('/')}
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          H
        </Box>
        <Box>
          <Typography fontWeight={800} fontSize={15} color="text.primary" lineHeight={1}>
            Hostezy
          </Typography>
          <Typography fontSize={10} color="text.secondary" letterSpacing={1} textTransform="uppercase">
            Student Portal
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Profile mini */}
      <Box
        sx={{
          mx: 2,
          mt: 2,
          mb: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.main',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontSize={13} fontWeight={700} color="text.primary" lineHeight={1.2}>
            {userName}
          </Typography>
          {user?.studentId ? (
            <Typography fontSize={11} color="text.secondary" mt={0.3}>
              {user.studentId}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1.5, pt: 0.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.label
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onSelect(item.label)}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  bgcolor: (theme) =>
                    isActive
                      ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.12)
                      : 'transparent',
                  color: (theme) =>
                    isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: (theme) =>
                      isActive
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.16)
                        : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  },
                  '& .MuiListItemIcon-root': {
                    color: (theme) =>
                      isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    minWidth: 36,
                  },
                }}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge
                      badgeContent={item.badge}
                      color="error"
                      sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                    >
                      <Icon fontSize="small" />
                    </Badge>
                  ) : (
                    <Icon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Drawer>
  )
}

export default StudentSidebarNav
