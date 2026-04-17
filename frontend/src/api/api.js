import axios from 'axios'
import { clearAuthStorage, getStoredToken, setStoredSessionExpiresAt, setStoredToken } from '../utils/authStorage.js'
import { emitToast } from '../utils/toastBus.js'

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // ✅ correct backend
  withCredentials: true, // ✅ good practice
})

const refreshClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
})

let refreshPromise = null
let unauthorizedHandler = null
let sessionExpiryHandler = null

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler
}

export const setSessionExpiryHandler = (handler) => {
  sessionExpiryHandler = handler
}

const isRefreshRequest = (url = '') => url.includes('/auth/refresh')

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((res) => {
        const token = res.data?.token
        if (token) setStoredToken(token)
        if (res.data?.sessionExpiresAt) {
          setStoredSessionExpiresAt(res.data.sessionExpiresAt)
          if (typeof sessionExpiryHandler === 'function') {
            sessionExpiryHandler(res.data.sessionExpiresAt)
          }
        }
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (!originalRequest || status !== 401 || originalRequest._retry || isRefreshRequest(originalRequest.url)) {
      const message = error?.response?.data?.message || error?.message || 'Request failed. Please try again.'
      emitToast({ severity: 'error', message })
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const nextToken = await refreshAccessToken()

      if (nextToken) {
        originalRequest.headers.Authorization = `Bearer ${nextToken}`
      }

      return api(originalRequest)
    } catch (refreshErr) {
      clearAuthStorage()
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler(refreshErr)
      }
      const message = refreshErr?.response?.data?.message || 'Your session has expired. Please sign in again.'
      emitToast({ severity: 'error', message })
      return Promise.reject(refreshErr)
    }
  },
)

export default api