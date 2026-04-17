import api from '../api/api'

const cleanParams = (params = {}) => {
  const nextParams = { ...params }

  if (typeof nextParams.search === 'string' && !nextParams.search.trim()) {
    delete nextParams.search
  }

  return nextParams
}

export const getPlans = async (params = {}) => {
  const response = await api.get('/mess/plans', { params: cleanParams(params) })
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

export const getSubscriptions = async (params = {}) => {
  const response = await api.get('/mess/subscriptions', { params: cleanParams(params) })
  return response.data?.data ?? []
}

export const getStudents = async (params = {}) => {
  const response = await api.get('/mess/students', { params: cleanParams(params) })
  return response.data?.data ?? []
}

export const getPayments = async (params = {}) => {
  const response = await api.get('/mess/payments', { params: cleanParams(params) })
  return response.data ?? { data: [], totalRevenue: 0 }
}

export const getMessMenu = async (date) => {
  const response = await api.get('/mess/menu', {
    params: date ? { date } : undefined,
  })
  return response.data?.data
}

export const updateMessMenu = async (payload) => {
  const response = await api.put('/mess/menu', payload)
  return response.data
}

export const approveRefund = async (id) => {
  const response = await api.post(`/mess/subscription/refund/${id}`)
  return response.data
}
