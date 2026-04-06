import api from '../api/api'

export const getStudentsByHostel = async () => {
  const response = await api.get('/reports/students-by-hostel')
  return response.data?.data ?? []
}
