import { useCallback, useEffect, useState } from 'react'
import {
  Box, Button, Card, CircularProgress, Typography, Alert,
  InputBase, InputAdornment,
} from '@mui/material'
import { Search, NotificationsActive } from '@mui/icons-material'
import api from '../api/api'

function MessNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchNotifications = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const response = await api.get('/notifications') // Assume endpoint exists
      setNotifications(response.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = notifications.filter(notif =>
    notif.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notif.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <Card sx={{ p: 2, minWidth: 240, bgcolor: '#fff' }}>
          <Typography fontSize={12} color="text.secondary" gutterBottom>
            Total notifications
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {notifications.length}
          </Typography>
        </Card>
      </Box>

      <Box sx={{ mb: 3 }}>
        <InputBase
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredNotifications.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
              <NotificationsActive sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
              <Typography color="text.secondary">
                {searchQuery ? 'Try adjusting your search.' : 'You\'re all caught up!'}
              </Typography>
            </Card>
          ) : (
            filteredNotifications.map((notif) => (
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