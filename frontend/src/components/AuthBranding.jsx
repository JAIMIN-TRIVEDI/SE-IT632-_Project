import { Box, Typography } from '@mui/material'

function AuthBranding({ title, description, backgroundImage }) {
  return (
    <Box
      sx={{
        flex: '0 0 40%',
        maxWidth: '40%',
        backgroundImage: backgroundImage
          ? `url('${backgroundImage}')`
          : (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                : 'linear-gradient(135deg, #2f61ff 0%, #1e40af 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#fff',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'flex-end',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
        '&::after': backgroundImage
          ? undefined
          : {
              content: '""',
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              bottom: -120,
              right: -120,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
            },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, backdropFilter: 'blur(4px)', bgcolor: 'rgba(30, 64, 175, 0.3)', p: 3, borderRadius: 2 }}>
        <Typography
          variant="h2"
          fontWeight={800}
          sx={{ mb: 2, lineHeight: 1.2, fontSize: '3rem', letterSpacing: -1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
        >
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.7, textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
          {description}
        </Typography>
      </Box>
    </Box>
  )
}

export default AuthBranding
