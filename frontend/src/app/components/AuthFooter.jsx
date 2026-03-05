import { Box, Typography } from '@mui/material'

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
      <Typography variant="caption" color="text.secondary">
        © 2024 Hostezy Management System. All rights reserved.
      </Typography>
    </Box>
  )
}

export default AuthFooter
