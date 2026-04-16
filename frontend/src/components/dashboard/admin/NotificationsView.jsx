import { useEffect, useState } from 'react'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { NotificationsActive } from '@mui/icons-material'
import NotificationComposerCard from './notifications/NotificationComposerCard.jsx'
import NotificationRecentList from './notifications/NotificationRecentList.jsx'
import {
  fetchNotificationBroadcasts,
  sendNotificationBroadcast,
} from '../../../services/notificationService'

const initialFormState = {
  title: '',
  message: '',
  audience: 'both',
}

function NotificationsView() {
  const [form, setForm] = useState(initialFormState)
  const [sending, setSending] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadRecentNotifications = async () => {
    try {
      setLoadingRecent(true)
      const items = await fetchNotificationBroadcasts()
      setRecentNotifications(items.slice(0, 6))
    } catch {
      setRecentNotifications([])
    } finally {
      setLoadingRecent(false)
    }
  }

  useEffect(() => {
    loadRecentNotifications()
  }, [])

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setSending(true)
      setError('')
      setSuccess('')

      const payload = {
        title: form.title,
        message: form.message,
        audience: form.audience,
      }

      const result = await sendNotificationBroadcast(payload)
      setSuccess(`Notification sent to ${result?.recipients ?? 0} users.`)
      setForm(initialFormState)
      await loadRecentNotifications()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Header ──────────────────────────────────────────────────────– */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <NotificationsActive sx={{ color: 'primary.main', fontSize: 28 }} />
        <Stack spacing={0} sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Notifications Hub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Send announcements to students, the warden, or both from one place
          </Typography>
        </Stack>
      </Box>

      {/* ── Alerts ──────────────────────────────────────────────────────– */}
      {error ? (
        <Box
          sx={{
            bgcolor: '#fee2e2',
            color: '#dc2626',
            p: 2,
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 600,
            mb: 2,
          }}
          role="alert"
        >
          {error}
        </Box>
      ) : null}

      {success ? (
        <Box
          sx={{
            bgcolor: '#dcfce7',
            color: '#15803d',
            p: 2,
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 600,
            mb: 2,
          }}
          role="alert"
        >
          {success}
        </Box>
      ) : null}

      {/* ── Main Content ────────────────────────────────────────────────– */}
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 960, xl: 1120 },
          mx: { xs: 0, lg: 'auto' },
        }}
      >
        <Stack spacing={2}>
          <NotificationComposerCard
            form={form}
            sending={sending}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
          />

          {loadingRecent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <NotificationRecentList items={recentNotifications} />
          )}
        </Stack>
      </Box>
    </Box>
  )
}

export default NotificationsView
