import { Box, Button, CircularProgress, InputBase, Stack, Typography } from '@mui/material'
import { DoneAll, Search } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import NotificationCard from './NotificationCard.jsx'

function NotificationsList({
  notifications = [],
  loading = false,
  search = '',
  onSearchChange = null,
  onMarkRead = null,
  onMarkAllRead = null,
  tab = 0,
  unreadCount = 0,
  markingAll = false,
  showSearch = true,
  showMarkAllButton = true,
  emptyMessage = 'No notifications yet',
  emptyDescription = 'Check back soon for updates',
}) {
  // Filter notifications based on tab and search
  const filtered = notifications.filter((n) => {
    if (tab === 1 && n.isRead) return false // Unread tab
    if (tab === 2 && !n.isRead) return false // Archived tab
    if (search.trim()) {
      const q = search.toLowerCase()
      return n.message?.toLowerCase().includes(q) || n.type?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search bar */}
      {showSearch && onSearchChange && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
          border: '1px solid', borderColor: 'divider', borderRadius: 10, px: 2, py: 0.8,
          mb: 3, maxWidth: 340,
        }}>
          <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
          <InputBase
            placeholder="Search alerts…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
          />
        </Box>
      )}
         {/* Mark all read button */}
      {showMarkAllButton && onMarkAllRead && unreadCount > 0 && !loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={markingAll}
            onClick={onMarkAllRead}
            startIcon={<DoneAll fontSize="small" />}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {markingAll ? 'Marking...' : 'Mark All as Read'}
          </Button>
        </Box>
      ) : null}
      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {/* Empty state */}
      {!loading && filtered.length === 0 ? (
        <Box
          sx={{
            py: 8,
            borderRadius: 2,
            textAlign: 'center',
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
          }}
        >
          <Typography fontWeight={700} color="text.secondary">
            {emptyMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {emptyDescription}
          </Typography>
        </Box>
      ) : null}

      {/* Notifications list */}
      {!loading && filtered.length > 0 ? (
        <Stack spacing={1.5}>
          {filtered.map((notif) => (
            <NotificationCard
              key={notif._id}
              notif={notif}
              onMarkRead={onMarkRead}
              query={search}
              isClickable={!!onMarkRead}
            />
          ))}
        </Stack>
      ) : null}

   
    </Box>
  )
}

export default NotificationsList
