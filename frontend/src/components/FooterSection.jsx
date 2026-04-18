import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import SendIcon from '@mui/icons-material/Send'
import LogoMark from './LogoMark.jsx'
import BrandImage from './BrandImage.jsx'

const columns = [
  {
    title: 'Product',
    links: ['Features', 'Admin Tools', 'Student Mobile App', 'Pricing'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'API Docs', 'Contact Support', 'Security'],
  },
]

function FooterSection() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#0b1224' : '#0f172a',
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(11, 18, 36, 1) 100%)'
            : 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(15, 23, 42, 1) 100%)',
        color: '#fff',
        pt: 8,
        pb: 4,
        borderTop: (theme) =>
          theme.palette.mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
          <Box sx={{ flex: 1 }}>
            <LogoMark />
            <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>
              The smarter way to manage your residential facilities. Built for speed,
              transparency, and ease of use.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={6} sx={{ flex: 1.2 }}>
            {columns.map((column) => (
              <Box key={column.title}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                  {column.title}
                </Typography>
                <Stack spacing={1.2}>
                  {column.links.map((link) => (
                    <Button
                      key={link}
                      color="inherit"
                      sx={{ justifyContent: 'flex-start', px: 0, color: 'rgba(255,255,255,0.7)' }}
                    >
                      {link}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
              Subscribe to Updates
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Get the latest news on product updates and new features.
            </Typography>
            <TextField
              fullWidth
              placeholder="Email address"
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton sx={{ color: '#fff' }}>
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'rgba(255,255,255,0.12)',
                  borderRadius: 2,
                  color: '#fff',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.25)',
                },
                '& input': {
                  color: '#fff',
                },
              }}
            />
          </Box>
        </Stack>
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              © 2024
            </Typography>
            <BrandImage width={125} sx={{ opacity: 0.9 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Systems Inc. All rights reserved.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button color="inherit" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Privacy Policy
            </Button>
            <Button color="inherit" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Terms of Service
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

export default FooterSection
