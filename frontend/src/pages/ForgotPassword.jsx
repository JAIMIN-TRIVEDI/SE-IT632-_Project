import { useState } from 'react'
import { Box, Typography, TextField, Button, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const { data } = await api.post('/auth/forgot-password', { email })

      setSuccess('Reset link generated! Redirecting...')

      // 👉 navigate with token
      setTimeout(() => {
        navigate(`/reset-password/${data.resetToken}`)
      }, 1500)

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f8fafc'
    }}>

      <Box sx={{
        width: 400,
        p: 4,
        bgcolor: '#fff',
        borderRadius: 4,
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>

        <Typography variant="h5" fontWeight={700} mb={1}>
          Forgot Password
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Enter your email to reset password
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1.3, borderRadius: 2 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>

      </Box>
    </Box>
  )
}

export default ForgotPassword