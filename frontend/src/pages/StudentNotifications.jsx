import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box, Snackbar, Tab, Tabs, Typography,
} from '@mui/material'
import { NotificationsActive } from '@mui/icons-material'
import api from '../api/api'
import NotificationsList from '../components/notifications/NotificationsList.jsx'

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentNotifications({ searchQuery = '' }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0) // 0=All, 1=Unread, 2=Archived
  const [search, setSearch] = useState('')
  const [markingAll, setMarkingAll] = useState(false)
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data?.data || [])
    } catch {
      notify('Failed to load notifications.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setSearch(searchQuery || '')
  }, [searchQuery])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
    } catch {
      notify('Failed to mark as read.', 'error')
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      notify('All notifications marked as read.', 'success')
    } catch {
      notify('Failed to mark all as read.', 'error')
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', width: '100%' }}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsActive sx={{ color: 'primary.main', fontSize: 26 }} />
          <Typography variant="h5" fontWeight={800} color="text.primary">Notifications</Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, newVal) => setTab(newVal)}
          variant="scrollable"
          scrollButtonsDisplay="auto"
          sx={{
            flex: 1,
            minWidth: 200,
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      {/* ── Notification List ─────────────────────────────────────────── */}
      <NotificationsList
        notifications={notifications}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        tab={tab}
        unreadCount={unreadCount}
        markingAll={markingAll}
        showSearch
        showMarkAllButton
        emptyMessage="No notifications yet"
        emptyDescription="Check back soon for updates"
      />

      {/* ── Snackbar ─────────────────────────────────────────────────────– */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Box
          sx={{
            bgcolor: snack.severity === 'success' ? '#dcfce7' : '#fee2e2',
            color: snack.severity === 'success' ? '#15803d' : '#dc2626',
            p: 2,
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {snack.msg}
        </Box>
      </Snackbar>
    </Box>
  )
}
