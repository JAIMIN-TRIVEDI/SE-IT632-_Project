import api from '../api/api'

export const getHostels = async () => {
  const response = await api.get('/hostels')
  return response.data?.data ?? []
}

export const getHostelById = async (id) => {
  const response = await api.get(`/hostels/${id}`)
  return response.data?.data
}

export const createHostel = async (payload) => {
  const response = await api.post('/hostels', payload)
  return response.data?.data
}

export const updateHostel = async (id, payload) => {
  const response = await api.put(`/hostels/${id}`, payload)
  return response.data?.data
}

export const deleteHostel = async (id) => {
  const response = await api.delete(`/hostels/${id}`)
  return response.data
}

export const assignWarden = async (id, wardenId) => {
  const response = await api.put(`/hostels/${id}/assign-warden`, { wardenId })
  return response.data?.data
}