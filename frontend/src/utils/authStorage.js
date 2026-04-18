const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'
const SESSION_EXPIRES_AT_KEY = 'sessionExpiresAt'

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const setStoredToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setStoredRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export const clearStoredRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const setStoredUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearStoredUser = () => {
  localStorage.removeItem(USER_KEY)
}

export const getStoredSessionExpiresAt = () => {
  const raw = localStorage.getItem(SESSION_EXPIRES_AT_KEY)
  if (!raw) return null

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export const setStoredSessionExpiresAt = (expiresAt) => {
  if (expiresAt) {
    localStorage.setItem(SESSION_EXPIRES_AT_KEY, String(expiresAt))
  }
}

export const clearStoredSessionExpiresAt = () => {
  localStorage.removeItem(SESSION_EXPIRES_AT_KEY)
}

export const clearAuthStorage = () => {
  clearStoredToken()
  clearStoredRefreshToken()
  clearStoredUser()
  clearStoredSessionExpiresAt()
}
