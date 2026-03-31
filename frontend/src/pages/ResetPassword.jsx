import { useState } from 'react'
import { Box, Typography, TextField, Button, Alert } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/api'

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      await api.post(`/auth/reset-password/${token}`, { password })

      setSuccess('Password updated successfully!')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token')
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

        <Typography variant="h5" fontWeight={700}>
          Reset Password
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <TextField
          fullWidth
          type="password"
          label="New Password"
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1.3 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>

      </Box>
    </Box>
  )
}

export default ResetPassword