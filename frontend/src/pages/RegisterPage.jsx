import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  Stack,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AuthLayout from '../layouts/AuthLayout.jsx'
import FormInput from '../components/FormInput.jsx'
import api from '../api/api.js'

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    gender: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend validations
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.gender) {
      return setError('Please fill in all required fields.')
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.')
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    if (!formData.agreedToTerms) {
      return setError('Please agree to the Terms of Service and Privacy Policy.')
    }

    setLoading(true)

    try {
      const { data } = await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        enrollmentNo: formData.studentId,
        gender: formData.gender,
        password: formData.password,
        role: 'student',
      })
      const authData = data?.data || data

      // Save token and user to localStorage
      localStorage.setItem('token', authData.token)
      localStorage.setItem('user', JSON.stringify(authData.user))

      // Redirect to dashboard after successful registration
      navigate('/login') // change this to your actual home/dashboard route
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout showFooter>
      <Box
        sx={{
          width: '100%',
          maxWidth: 700,
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: { xs: 3, md: 6 },
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.3)'
              : '0 20px 60px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Create your Student Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Join the Hostezy community and manage your stay with ease.
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleRegister}>
          <Stack spacing={3}>
            {/* Full Name */}
            <FormInput
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              icon="👤"
            />

            {/* Email Address */}
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="student@university.edu"
              value={formData.email}
              onChange={handleChange}
              icon="📧"
            />

            {/* Phone Number & Student ID */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  icon="📱"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Student ID"
                  name="studentId"
                  type="text"
                  placeholder="ID-12345678"
                  value={formData.studentId}
                  onChange={handleChange}
                  icon="🎓"
                />
              </Grid>
            </Grid>

            {/* Gender Selection */}
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Gender
              </Typography>
              <RadioGroup
                row
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
              </RadioGroup>
            </Box>

            {/* Password & Confirm Password */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon="🔒"
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon="🔒"
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </Grid>
            </Grid>

            {/* Terms Checkbox */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link
                      component="button"
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle terms
                      }}
                      underline="none"
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      component="button"
                      onClick={(e) => {
                        e.preventDefault()
                        // Handle privacy
                      }}
                      underline="none"
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    >
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
            </Box>

            {/* Register Button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
              type="submit"
              disabled={loading}
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                py: 1.6,
                boxShadow: '0 4px 20px rgba(47, 97, 255, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 28px rgba(47, 97, 255, 0.4)',
                },
              }}
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                  underline="none"
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Stack>
        </form>
      </Box>
    </AuthLayout>
  )
}

export default RegisterPage