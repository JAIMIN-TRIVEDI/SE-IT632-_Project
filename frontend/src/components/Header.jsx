import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded'
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded'
import LogoMark from './LogoMark.jsx'

const navItems = [
  { label: 'Features', kind: 'section', targetId: 'features' },
  { label: 'Testimonials', kind: 'section', targetId: 'testimonials' },
  { label: 'About', kind: 'route', path: '/about' },
  { label: 'Contact', kind: 'section', targetId: 'contact' },
]

function Header({ mode, onToggleTheme }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavItemClick = (item) => {
    if (item.kind === 'route' && item.path) {
      navigate(item.path)
      setIsMenuOpen(false)
      return
    }

    if (item.kind === 'section' && item.targetId) {
      if (location.pathname !== '/') {
        navigate(`/#${item.targetId}`)
      } else {
        const section = document.getElementById(item.targetId)

        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    setIsMenuOpen(false)
  }

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 2, gap: 3, minHeight: 'auto' }}>
          <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <LogoMark />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
            }}
          >
            <Stack direction="row" spacing={3}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                  onClick={() => handleNavItemClick(item)}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              color="inherit"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuRoundedIcon />
            </IconButton>
            <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
              <IconButton color="inherit" onClick={onToggleTheme}>
                {mode === 'dark' ? <Brightness7RoundedIcon /> : <Brightness4RoundedIcon />}
              </IconButton>
            </Tooltip>
            <Button color="inherit" sx={{ fontWeight: 600 }} onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ px: 3 }}
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Stack>
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={() => setIsMenuOpen(false)} aria-label="Close navigation menu">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <List sx={{ py: 0 }}>
            {navItems.map((item) => (
              <ListItemButton key={item.label} onClick={() => handleNavItemClick(item)}>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}

export default Header
