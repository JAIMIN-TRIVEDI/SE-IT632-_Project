import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, Chip, CircularProgress,
  InputAdornment, InputBase, Snackbar, Tab, Tabs, Typography,
} from '@mui/material'
import {
  NotificationsActive, Search, DoneAll, CreditCard,
  Restaurant, Settings, Info, Warning, Chat,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import api from '../api/api'
import HighlightMatch from '../components/HighlightMatch.jsx'

// ── Icon / colour mapping by notification type ─────────────────────────────────
function getNotifStyle(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('payment') || t.includes('rent') || t.includes('fee') || t.includes('invoice'))
    return { icon: CreditCard, color: '#16a34a', bg: '#dcfce7' }
  if (t.includes('mess') || t.includes('menu') || t.includes('food'))
    return { icon: Restaurant, color: '#d97706', bg: '#fef3c7' }
  if (t.includes('maintenance') || t.includes('wifi') || t.includes('system') || t.includes('alert'))
    return { icon: Settings, color: '#0891b2', bg: '#e0f2fe' }
  if (t.includes('warn') || t.includes('complaint'))
    return { icon: Warning, color: '#dc2626', bg: '#fee2e2' }
  if (t.includes('message') || t.includes('feedback') || t.includes('request'))
    return { icon: Chat, color: '#7c3aed', bg: '#ede9fe' }
  return { icon: Info, color: '#64748b', bg: '#f1f5f9' }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Single notification card ───────────────────────────────────────────────────
function NotifCard({ notif, onMarkRead, query = '' }) {
  const { icon: Icon, color, bg } = getNotifStyle(notif.type || notif.message)
  const isUnread = !notif.isRead
  const timeStr = formatRelativeTime(notif.createdAt)

  return (
    <Box
      sx={{
        p: 2.5, borderRadius: 2, position: 'relative',
        bgcolor: isUnread
          ? (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff'
          : 'transparent',
        border: isUnread ? '1px solid' : '1px solid transparent',
        borderColor: isUnread ? 'divider' : 'transparent',
        opacity: isUnread ? 1 : 0.65,
        transition: 'all 0.15s',
        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04), opacity: 1 },
        cursor: isUnread ? 'pointer' : 'default',
      }}
      onClick={() => isUnread && onMarkRead(notif._id)}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* Icon */}
        <Box sx={{
          width: 42, height: 42, borderRadius: '50%', bgcolor: bg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography fontWeight={isUnread ? 700 : 600} fontSize={14} color="text.primary">
              <HighlightMatch
                text={notif.type
                  ? notif.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  : 'Notification'}
                query={query}
              />
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Typography fontSize={12} color="text.secondary" whiteSpace="nowrap">{timeStr}</Typography>
              {isUnread && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
              )}
            </Box>
          </Box>
          <Typography fontSize={13} color="text.secondary" mt={0.4} lineHeight={1.6}>
            <HighlightMatch text={notif.message} query={query} />
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

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

  const filtered = useMemo(() => {
    let list = notifications
    if (tab === 1) list = list.filter((n) => !n.isRead)
    // tab 2 = archived: show read ones
    if (tab === 2) list = list.filter((n) => n.isRead)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((n) =>
        n.message?.toLowerCase().includes(q) || n.type?.toLowerCase().includes(q)
      )
    }
    return list
  }, [notifications, tab, search])

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

        {/* Search */}
        <Box sx={{
          flex: 1, minWidth: 200, maxWidth: 340,
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
          border: '1px solid', borderColor: 'divider', borderRadius: 10, px: 2, py: 0.8,
        }}>
          <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
          <InputBase
            placeholder="Search alerts…" value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Mark all read */}
        <Button
          variant="contained"
          disabled={unreadCount === 0 || markingAll}
          onClick={handleMarkAllRead}
          startIcon={markingAll ? <CircularProgress size={16} color="inherit" /> : <DoneAll fontSize="small" />}
          sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', fontSize: 13, px: 2.5,
            background: 'linear-gradient(90deg, #2f61ff 0%, #1e40af 100%)',
            '&:hover': { background: 'linear-gradient(90deg, #1e4fdb 0%, #1a369a 100%)' },
          }}
        >
          Mark all as read
        </Button>
      </Box>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14, minWidth: 'auto', px: 0, mr: 4 } }}>
          <Tab label="All Notifications" />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Unread
              {unreadCount > 0 && (
                <Chip label={unreadCount} size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: 'primary.main', color: '#fff',
                    '& .MuiChip-label': { px: 1 } }} />
              )}
            </Box>
          } />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      {/* ── List ────────────────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <NotificationsActive sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography fontWeight={600} color="text.secondary">
            {search ? 'No results found' : tab === 1 ? 'All caught up!' : 'No notifications'}
          </Typography>
          <Typography fontSize={13} color="text.secondary" mt={0.5}>
            {tab === 1 ? 'You have no unread notifications.' : 'Notifications will appear here.'}
          </Typography>
        </Card>
      ) : (
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', divide: 'divider' }}>
            {filtered.map((n, i) => (
              <Box key={n._id}>
                <NotifCard notif={n} onMarkRead={handleMarkRead} query={searchQuery} />
                {i < filtered.length - 1 && (
                  <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mx: 2.5 }} />
                )}
              </Box>
            ))}
          </Box>

          {/* View older button */}
          {tab === 0 && notifications.length > 5 && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Button variant="text" color="inherit"
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, color: 'text.secondary' }}>
                View older notifications ↓
              </Button>
            </Box>
          )}
        </Card>
      )}

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack((p) => ({ ...p, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
