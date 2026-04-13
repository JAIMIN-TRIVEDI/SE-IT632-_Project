import api from '../api/api'

export const getPlans = async () => {
  const response = await api.get('/mess/plans')
  return response.data?.data ?? []
}

export const createPlan = async (payload) => {
  const response = await api.post('/mess/plans', payload)
  return response.data?.data
}

export const updatePlan = async (id, payload) => {
  const response = await api.put(`/mess/plans/${id}`, payload)
  return response.data?.data
}

export const deletePlan = async (id) => {
  const response = await api.delete(`/mess/plans/${id}`)
  return response.data
}

export const getSubscriptions = async () => {
  const response = await api.get('/mess/subscriptions')
  return response.data?.data ?? []
}

export const getStudents = async () => {
  const response = await api.get('/mess/students')
  return response.data?.data ?? []
}

export const getPayments = async () => {
  const response = await api.get('/mess/payments')
  return response.data ?? { data: [], totalRevenue: 0 }
}

export const getMessMenu = async () => {
  const response = await api.get('/mess/menu')
  return response.data?.data
}

export const updateMessMenu = async (payload) => {
  const response = await api.put('/mess/menu', payload)
  return response.data?.data
}

export const approveRefund = async (id) => {
  const response = await api.post(`/mess/subscription/refund/${id}`)
  return response.data
}
