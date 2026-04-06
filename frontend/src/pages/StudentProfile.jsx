import { useEffect, useRef, useState, useMemo } from 'react'
import {
  Alert, Avatar, Box, Button, Card, Chip, CircularProgress,
  Divider, Grid, MenuItem, Snackbar, TextField, Typography,
} from '@mui/material'
import {
  CameraAlt, BadgeOutlined, CalendarMonth, Save, Lock,
  ManageAccounts,
} from '@mui/icons-material'
import api from '../api/api'

const RELATIONSHIPS = ['Parent', 'Sibling', 'Spouse', 'Guardian', 'Friend', 'Other']

const emptyForm = {
  name: '', email: '', phone: '', enrollmentNo: '', gender: '', role: '',
  emergencyName: '', emergencyRelationship: '', emergencyPhone: '', emergencyAddress: '',
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

export default function StudentProfile({ initialUser, onProfileUpdated }) {
  const [form, setForm] = useState(emptyForm)
  const [original, setOriginal] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [roomInfo, setRoomInfo] = useState(null)

  const hasChanges = useMemo(() => (
    form.name !== original.name ||
    form.phone !== original.phone ||
    form.enrollmentNo !== original.enrollmentNo ||
    form.emergencyName !== original.emergencyName ||
    form.emergencyRelationship !== original.emergencyRelationship ||
    form.emergencyPhone !== original.emergencyPhone ||
    form.emergencyAddress !== original.emergencyAddress
  ), [form, original])

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        // fetch real profile
        const res = await api.get('/auth/me')
        const u = res.data || {}
        // also try dashboard for room info
        try {
          const dash = await api.get('/user/student/dashboard')
          setRoomInfo(dash.data?.data?.room || null)
          setLastUpdated(dash.data?.data?.user?.updatedAt || u.updatedAt || null)
        } catch (_) {}

        const profile = {
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          enrollmentNo: u.enrollmentNo || '',
          gender: u.gender || '',
          role: u.role || '',
          emergencyName: u.emergencyName || '',
          emergencyRelationship: u.emergencyRelationship || '',
          emergencyPhone: u.emergencyPhone || '',
          emergencyAddress: u.emergencyAddress || '',
        }
        setForm(profile)
        setOriginal(profile)
        setLastUpdated(u.updatedAt || null)
      } catch (err) {
        // fallback to initialUser
        if (initialUser) {
          const fallback = {
            name: initialUser.name || '', email: initialUser.email || '',
            phone: initialUser.phone || '', enrollmentNo: initialUser.enrollmentNo || '',
            gender: initialUser.gender || '', role: initialUser.role || '',
            emergencyName: '', emergencyRelationship: '', emergencyPhone: '', emergencyAddress: '',
          }
          setForm(fallback)
          setOriginal(fallback)
        }
        setError('Could not load full profile. Showing available data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialUser])

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  const handleReset = () => setForm(original)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setSnack({ open: true, msg: 'Name is required.', severity: 'error' }); return }
    setSaving(true)
    try {
      const res = await api.put('/auth/me', {
        name: form.name, phone: form.phone, enrollmentNo: form.enrollmentNo,
        emergencyName: form.emergencyName, emergencyRelationship: form.emergencyRelationship,
        emergencyPhone: form.emergencyPhone, emergencyAddress: form.emergencyAddress,
      })
      const u = res.data?.data || {}
      const updated = { ...form, name: u.name || form.name, phone: u.phone || form.phone }
      setForm(updated)
      setOriginal(updated)
      setLastUpdated(new Date().toISOString())
      onProfileUpdated?.(updated)
      setSnack({ open: true, msg: 'Profile updated successfully.', severity: 'success' })
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to update profile.', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const initials = form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'S'
  const roomDisplay = roomInfo ? `Room ${roomInfo.roomNumber}` : 'No Room'
  const enrollDisplay = form.enrollmentNo || 'N/A'
  const joinedDisplay = lastUpdated
    ? `Joined ${new Date(lastUpdated).toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
    : ''

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" fontWeight={800} color="text.primary">My Profile</Typography>

      {error && <Alert severity="warning" sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {/* Avatar with camera */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              sx={{
                width: 88, height: 88, fontSize: 32, fontWeight: 800,
                bgcolor: 'primary.main', border: '4px solid', borderColor: 'background.paper',
                boxShadow: '0 4px 16px rgba(47,97,255,0.25)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{
              position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
              bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid', borderColor: 'background.paper', cursor: 'pointer',
            }}>
              <CameraAlt sx={{ fontSize: 14, color: '#fff' }} />
            </Box>
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} color="text.primary">{form.name || 'Student'}</Typography>
            <Typography fontSize={14} color="text.secondary" mt={0.3}>
              Resident • {roomDisplay}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <BadgeOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography fontSize={13} color="text.secondary">{enrollDisplay}</Typography>
              </Box>
              {joinedDisplay && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  <CalendarMonth sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography fontSize={13} color="text.secondary">{joinedDisplay}</Typography>
                </Box>
              )}
              <Chip
                label={String(form.role).replace(/_/g, ' ')}
                size="small"
                sx={{ height: 22, fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                  color: 'primary.main',
                  bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(47,97,255,0.15)' : '#eff6ff',
                }}
              />
            </Box>
          </Box>

          <Button variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', flexShrink: 0 }}>
            View History
          </Button>
        </Box>
      </Card>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Personal Information */}
        <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography fontWeight={700} fontSize={16} mb={2.5}>Personal Information</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Full Name</Typography>
              <TextField fullWidth value={form.name} onChange={handleChange('name')} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Phone Number</Typography>
              <TextField fullWidth value={form.phone} onChange={handleChange('phone')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12}>
              <Typography paddingX={10} justifyContent='center' fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>
                Email Address
              </Typography>
              <TextField fullWidth placeholder="e.g. personal@example.com" disabled value={form.email}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
          </Grid>
        </Card>

        {/* Emergency Contact */}
        <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography fontWeight={700} fontSize={16} mb={2.5}>Emergency Contact Details</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Contact Name</Typography>
              <TextField fullWidth value={form.emergencyName} onChange={handleChange('emergencyName')}
                placeholder="e.g. Father's name..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Relationship</Typography>
              <TextField select fullWidth value={form.emergencyRelationship} onChange={handleChange('emergencyRelationship')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <MenuItem value="" defaultValue={"Select relationship"}><em>Select relationship</em></MenuItem>
                {RELATIONSHIPS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <br />
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>Contact Phone</Typography>
              <TextField fullWidth value={form.emergencyPhone} onChange={handleChange('emergencyPhone')}
                placeholder="+91 1234567890"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={0.8}>
                Emergency Address <Typography component="span" fontSize={12} color="text.disabled">(Optional)</Typography>
              </Typography>
              <TextField fullWidth value={form.emergencyAddress} onChange={handleChange('emergencyAddress')}
                placeholder="12, Ashirwad Sky, Vasna"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            {lastUpdated ? (
              <Typography fontSize={13} color="text.disabled">
                Last updated: {formatRelativeTime(lastUpdated)}
              </Typography>
            ) : <Box />}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="outlined" color="inherit" onClick={handleReset} disabled={!hasChanges || saving}
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', borderColor: 'divider' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={!hasChanges || saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save fontSize="small" />}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Account Security */}
        <Card sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock sx={{ color: '#ea580c', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize={15}>Account Security</Typography>
                <Typography fontSize={13} color="text.secondary">
                  Enable Two-Factor Authentication for better protection.
                </Typography>
              </Box>
            </Box>
            <Button variant="text" color="primary" startIcon={<ManageAccounts />}
              sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0, fontSize: 14 }}>
              Manage Security Settings
            </Button>
          </Box>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography fontSize={11} color="text.disabled" letterSpacing={1} textTransform="uppercase" mb={1}>
            Hostezy Resident Management System V2.4.0
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {['Privacy Policy', 'Terms of Service', 'Help Center'].map((l) => (
              <Typography key={l} fontSize={12} color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                {l}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}