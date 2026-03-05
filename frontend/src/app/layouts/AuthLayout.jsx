import { Box } from '@mui/material'
import AuthHeader from '../components/AuthHeader.jsx'
import AuthFooter from '../components/AuthFooter.jsx'

function AuthLayout({ children, showHeader = true, showFooter = true }) {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showHeader && <AuthHeader />}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Box>
      {showFooter && <AuthFooter />}
    </Box>
  )
}

export default AuthLayout
