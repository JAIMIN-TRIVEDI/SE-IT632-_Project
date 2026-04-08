import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Avatar, Box, Button, Card, CircularProgress,
  Grid, Snackbar, TextField, Typography,
} from '@mui/material'
import { CameraAlt, BadgeOutlined, CalendarMonth, Save } from '@mui/icons-material'
import api from '../../api/api'

const emptyForm = {
  name: '', email: '', phone: '', gender: '', role: '',
}

export default function WardenProfile() {
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
        const res = await api.get('/auth/me')
        const user = res.data || {}
        const profile = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          role: user.role || '',
        }
        setForm(profile)
        setOriginal(profile)
        setLastUpdated(user.updatedAt || null)
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setSnack({ open: true, msg: 'Name is required.', severity: 'error' })
      return
    }
    setSaving(true)
    try {
      const res = await api.put('/auth/me', {
        name: form.name,
        phone: form.phone,
      })
      const user = res.data?.data || {}
      const updated = {
        ...form,
        name: user.name || form.name,
        phone: user.phone || form.phone,
      }
      setForm(updated)
      setOriginal(updated)
      setLastUpdated(new Date().toISOString())
      setSnack({ open: true, msg: 'Profile updated successfully.', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to update profile.', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const initials = form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'W'
  const joinedDisplay = lastUpdated
    ? `Joined ${new Date(lastUpdated).toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
    : ''

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} color="text.primary">
        My Profile
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar sx={{ width: 88, height: 88, fontSize: 32, fontWeight: 800, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
            <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid', borderColor: 'background.paper' }}>
              <CameraAlt sx={{ fontSize: 14, color: '#fff' }} />
            </Box>
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h5" fontWeight={800} color="text.primary">{form.name || 'Warden'}</Typography>
            <Typography fontSize={14} color="text.secondary" mt={0.5}>{joinedDisplay}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <BadgeOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography fontSize={13} color="text.secondary">{form.role || 'warden'}</Typography>
              </Box>
            </Box>
          </Box>
          <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>View History</Button>
        </Box>
      </Card>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography fontWeight={700} fontSize={16} mb={2.5}>Personal Information</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Full Name</Typography>
              <TextField fullWidth value={form.name} onChange={handleChange('name')} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Phone Number</Typography>
              <TextField fullWidth value={form.phone} onChange={handleChange('phone')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Email Address</Typography>
              <TextField fullWidth disabled value={form.email} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
          </Grid>
        </Card>


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button type="button" variant="outlined" onClick={() => setForm(original)} disabled={!hasChanges} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            Discard
          </Button>
          <Button type="submit" variant="contained" disabled={!hasChanges || saving} startIcon={<Save />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}> {snack.msg} </Alert>
      </Snackbar>
    </Box>
  )
}
