import api from '../api/api'

const normalizeBroadcast = (broadcast) => ({
  id: broadcast.broadcastId,
  title: broadcast.title || '',
  message: broadcast.message || '',
  audience: broadcast.audience || 'student',
  recipientCount: Number(broadcast.recipientCount || 0),
  createdAt: broadcast.createdAt,
})

export const fetchNotificationBroadcasts = async () => {
  const response = await api.get('/admin/notifications')
  const broadcasts = Array.isArray(response.data?.data?.broadcasts)
    ? response.data.data.broadcasts
    : []

  return broadcasts.map(normalizeBroadcast)
}

export const sendNotificationBroadcast = async (payload) => {
  const response = await api.post('/admin/notifications/broadcast', payload)
  return response.data?.data || null
}

export const sendMessAdminNotification = async (payload) => {
  const response = await api.post('/notifications/send', payload)
  return response.data?.data || null
}

export const sendWardenNotification = async (payload) => {
  const response = await api.post('/notifications/send', payload)
  return response.data?.data || null
}

export const fetchSentMessNotifications = async (params = {}) => {
  const response = await api.get('/notifications/sent', { params })
  return response.data?.data || []
}

export const fetchSentWardenNotifications = async (params = {}) => {
  const response = await api.get('/notifications/sent', { params })
  return response.data?.data || []
}

export const deleteNotificationById = async (id) => {
  await api.delete(`/notifications/${id}`)
}
