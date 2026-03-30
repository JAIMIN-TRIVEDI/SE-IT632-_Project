import { useState } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Typography, Link, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AuthBranding from '../components/AuthBranding.jsx'
import FormInput from '../components/FormInput.jsx'
import SocialAuthButtons from '../components/SocialAuthButtons.jsx'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log({ email, password, rememberMe })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left Side - Branding with Background Image */}
      <AuthBranding
        title="Your home away from home."
        description="Join thousands of students managing their stays effortlessly with our modern hostel management platform."
        backgroundImage="/src/assets/images/Image.png"
      />

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please enter your details to sign in.
          </Typography>

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              {/* Email Field */}
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="📧"
              />

              {/* Password Field */}
              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon="🔒"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              {/* Remember Me & Forgot Password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link
                  component="button"
                  onClick={(e) => {
                    e.preventDefault()
                    // Handle forgot password
                  }}
                  underline="none"
                  sx={{ fontWeight: 600, color: 'primary.main', fontSize: 14 }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Sign In Button */}
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  py: 1.5,
                  boxShadow: '0 4px 20px rgba(47, 97, 255, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 28px rgba(47, 97, 255, 0.4)',
                  },
                }}
              >
                Sign in to Account
              </Button>

              {/* Social Auth Buttons */}
              <SocialAuthButtons />

              {/* Register Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/register')
                    }}
                    underline="none"
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                  >
                    Register now
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
