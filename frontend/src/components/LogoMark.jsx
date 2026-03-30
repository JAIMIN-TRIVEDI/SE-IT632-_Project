import { Box, Typography } from '@mui/material'

function LogoMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2.2,
          background: 'linear-gradient(135deg, #2f61ff 0%, #62a1ff 100%)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        H
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
        Hostezy
      </Typography>
    </Box>
  )
}

export default LogoMark
