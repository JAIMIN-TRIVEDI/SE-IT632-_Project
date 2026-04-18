import { Box, Typography } from '@mui/material'
import BrandImage from './BrandImage.jsx'

function AuthFooter() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 3,
        textAlign: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">© 2024</Typography>
        <BrandImage width={120} />
        <Typography variant="caption" color="text.secondary">Management System. All rights reserved.</Typography>
      </Box>
    </Box>
  )
}

export default AuthFooter
