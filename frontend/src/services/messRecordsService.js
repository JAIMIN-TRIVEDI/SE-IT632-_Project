import api from '../api/api'

const normalizeResponse = (payload = {}) => ({
  items: payload.data || [],
  pagination: payload.pagination || {
    page: 1,
    limit: 10,
    totalRecords: Array.isArray(payload.data) ? payload.data.length : 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  stats: payload.stats || {},
  totalRevenue: payload.totalRevenue || 0,
})

export const fetchStudentsRecords = async (params = {}) => {
  const response = await api.get('/mess/students/subscribed', { params })
  return normalizeResponse(response.data)
}

export const fetchSubscriptionsRecords = async (params = {}) => {
  const response = await api.get('/mess/subscriptions', { params })
  return normalizeResponse(response.data)
}

export const fetchPaymentsRecords = async (params = {}) => {
  const response = await api.get('/mess/payments', { params })
  return normalizeResponse(response.data)
}
