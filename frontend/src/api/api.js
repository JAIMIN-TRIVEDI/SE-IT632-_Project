import axios from 'axios'
import {
  clearAuthStorage,
  getStoredRefreshToken,
  getStoredSessionExpiresAt,
  getStoredToken,
  setStoredRefreshToken,
  setStoredSessionExpiresAt,
  setStoredToken,
} from '../utils/authStorage.js'
import { emitToast } from '../utils/toastBus.js'

const DEFAULT_DEV_API_URL = 'http://localhost:5000/api/v1'
const DEFAULT_PROD_API_URL = 'https://hostezy.onrender.com/api/v1'

const BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL)

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ good practice
})

const refreshClient = axios.create({
  baseURL: BASE_URL,
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
const isMeRequest = (url = '') => url.includes('/auth/me')

const hasRefreshCapability = () => {
  const refreshToken = getStoredRefreshToken()
  if (refreshToken) return true

  const sessionExpiresAt = getStoredSessionExpiresAt()
  return Boolean(sessionExpiresAt && sessionExpiresAt > Date.now())
}

const getNormalizedAuthPayload = (payload) => payload?.data || payload || {}

const shouldSilenceAuthError = (error) => {
  const status = error?.response?.status
  const url = error?.config?.url || ''

  if (status !== 401) return false
  return isMeRequest(url) || isRefreshRequest(url)
}

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refreshToken = getStoredRefreshToken()
    const payload = refreshToken ? { refreshToken } : undefined

    refreshPromise = refreshClient
      .post('/auth/refresh', payload)
      .then((res) => {
        const authData = getNormalizedAuthPayload(res.data)
        const token = authData?.token
        const nextRefreshToken = authData?.refreshToken

        if (token) setStoredToken(token)
        if (nextRefreshToken) setStoredRefreshToken(nextRefreshToken)
        if (authData?.sessionExpiresAt) {
          setStoredSessionExpiresAt(authData.sessionExpiresAt)
          if (typeof sessionExpiryHandler === 'function') {
            sessionExpiryHandler(authData.sessionExpiresAt)
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
      if (!shouldSilenceAuthError(error)) {
        const message = error?.response?.data?.message || error?.message || 'Request failed. Please try again.'
        emitToast({ severity: 'error', message })
      }
      return Promise.reject(error)
    }

    // For access-only setups (no refresh), skip refresh flow completely.
    if (!hasRefreshCapability()) {
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler(error)
      }
      if (!shouldSilenceAuthError(error)) {
        const message = error?.response?.data?.message || error?.message || 'Session expired. Please sign in again.'
        emitToast({ severity: 'error', message })
      }
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

      if (!shouldSilenceAuthError(refreshErr)) {
        const message = refreshErr?.response?.data?.message || 'Your session has expired. Please sign in again.'
        emitToast({ severity: 'error', message })
      }

      return Promise.reject(refreshErr)
    }
  },
)

export default api