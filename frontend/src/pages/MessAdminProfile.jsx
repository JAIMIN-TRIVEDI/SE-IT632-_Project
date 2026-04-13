import { useEffect, useState, useMemo } from 'react'
import {
  Alert, Avatar, Box, Button, Card, CircularProgress,
  Divider, Grid, Snackbar, TextField, Typography,
} from '@mui/material'
import { Save, ManageAccounts } from '@mui/icons-material'
import api from '../api/api'

const emptyForm = {
  name: '', email: '', phone: '',
}

function formatRelativeTime(date) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function MessAdminProfile() {
  const [form, setForm] = useState(emptyForm)
  const [original, setOriginal] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const [lastUpdated, setLastUpdated] = useState(null)

  const hasChanges = useMemo(() => (
    form.name !== original.name ||
    form.phone !== original.phone
  ), [form, original])

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const res = await api.get('/auth/me')
        const u = res.data || {}
        const profile = {
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
        }
        setForm(profile)
        setOriginal(profile)
        setLastUpdated(u.updatedAt || null)
      } catch (err) {
        setError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      await api.put('/auth/update-profile', {
        name: form.name,
        phone: form.phone,
      })
      setOriginal(form)
      setSnack({ open: true, msg: 'Profile updated successfully!', severity: 'success' })
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
      setSnack({ open: true, msg: 'Failed to update profile.', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            My Profile
          </Typography>
          <Typography color="text.secondary">
            Manage your account information and preferences.
          </Typography>
        </Box>
        {lastUpdated && (
          <Typography color="text.secondary" fontSize={14}>
            Last updated {formatRelativeTime(lastUpdated)}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64 }}>
            <ManageAccounts fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {form.name || 'Mess Admin'}
            </Typography>
            <Typography color="text.secondary">
              {form.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              onChange={handleChange('name')}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={form.email}
              disabled
              variant="outlined"
              helperText="Email cannot be changed"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={form.phone}
              onChange={handleChange('phone')}
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            sx={{ textTransform: 'none' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MessAdminProfile