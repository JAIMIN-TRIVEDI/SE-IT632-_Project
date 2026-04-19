import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Card, CircularProgress, Typography, Alert, Skeleton,
  InputBase, InputAdornment,
} from '@mui/material'
import { Search, NotificationsActive } from '@mui/icons-material'
import api from '../api/api'
import { useSearch } from '../hooks/useSearch'

function MessNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { search, setSearch, isDebouncing, buildSearchParams } = useSearch('', 400)

  const fetchNotifications = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const response = await api.get('/notifications', { params: buildSearchParams() })
      setNotifications(response.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [buildSearchParams])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Notifications
          </Typography>
          <Typography color="text.secondary">
            Stay updated with mess-related announcements and updates.
          </Typography>
        </Box>
        <Card sx={{ p: 2, minWidth: 240, bgcolor: 'background.paper' }}>
          <Typography fontSize={12} color="text.secondary" gutterBottom>
            Total notifications
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {notifications.length}
          </Typography>
        </Card>
        <Button variant="outlined" onClick={fetchNotifications} disabled={loading} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <InputBase
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 2,
            py: 1,
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchNotifications}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading || isDebouncing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={100} />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
              <NotificationsActive sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
              <Typography color="text.secondary">
                {search.trim() ? 'Try adjusting your search.' : 'You\'re all caught up!'}
              </Typography>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card key={notif._id} sx={{ p: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                <Typography fontWeight={600} mb={1}>
                  {notif.type || 'Notification'}
                </Typography>
                <Typography color="text.secondary" mb={1}>
                  {notif.message}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {new Date(notif.createdAt).toLocaleString()}
                </Typography>
              </Card>
            ))
          )}
        </Box>
      )}
    </Box>
  )
}

export default MessNotifications