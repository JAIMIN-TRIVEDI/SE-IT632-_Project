import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded'
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded'
import LogoMark from './LogoMark.jsx'

const navItems = ['Features', 'Pricing', 'About']

function Header({ mode, onToggleTheme }) {
  const navigate = useNavigate()

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
                <Button key={item} color="inherit" sx={{ fontWeight: 600 }}>
                  {item}
                </Button>
              ))}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
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
    </AppBar>
  )
}

export default Header
