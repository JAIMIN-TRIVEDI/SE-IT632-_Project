import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { setSessionExpiryHandler, setUnauthorizedHandler } from '../api/api.js'
import {
  clearAuthStorage,
  clearStoredSessionExpiresAt,
  getStoredUser,
  getStoredSessionExpiresAt,
  setStoredToken,
  setStoredSessionExpiresAt,
  setStoredUser,
} from '../utils/authStorage.js'

const AuthContext = createContext(null)

const normalizeMePayload = (payload) => payload?.user || payload?.data || payload || null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getStoredUser()))
  const [isInitializing, setIsInitializing] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState(getStoredSessionExpiresAt())
  const sessionTimerRef = useRef(null)
  const navigate = useNavigate()

  const clearSession = useCallback(({ redirectToLogin = false } = {}) => {
    setUser(null)
    setIsAuthenticated(false)
    setSessionExpiresAt(null)
    clearAuthStorage()

    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current)
      sessionTimerRef.current = null
    }

    if (redirectToLogin) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const applyAuthState = useCallback((authUser, token, expiresAt) => {
    setUser(authUser)
    setIsAuthenticated(Boolean(authUser))
    setSessionExpiresAt(expiresAt || null)

    if (authUser) {
      setStoredUser(authUser)
    }

    if (token) {
      setStoredToken(token)
    }

    if (expiresAt) {
      setStoredSessionExpiresAt(expiresAt)
    } else {
      clearStoredSessionExpiresAt()
    }
  }, [])

  const bootstrapAuth = useCallback(async () => {
    try {
      const storedExpiresAt = getStoredSessionExpiresAt()

      if (storedExpiresAt && storedExpiresAt <= Date.now()) {
        clearSession()
        return
      }

      const response = await api.get('/auth/me')
      const me = normalizeMePayload(response.data)

      if (!me) {
        clearSession()
        return
      }

      applyAuthState(me, undefined, storedExpiresAt)
    } catch {
      clearSession()
    } finally {
      setIsInitializing(false)
    }
  }, [applyAuthState, clearSession])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession({ redirectToLogin: true })
    })

    setSessionExpiryHandler((expiresAt) => {
      setSessionExpiresAt(expiresAt)
      setStoredSessionExpiresAt(expiresAt)
    })

    bootstrapAuth()
  }, [bootstrapAuth, clearSession])

  useEffect(() => {
    if (!sessionExpiresAt) {
      return undefined
    }

    const remainingMs = sessionExpiresAt - Date.now()

    if (remainingMs <= 0) {
      clearSession({ redirectToLogin: true })
      return undefined
    }

    sessionTimerRef.current = setTimeout(() => {
      clearSession({ redirectToLogin: true })
    }, remainingMs)

    return () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current)
        sessionTimerRef.current = null
      }
    }
  }, [sessionExpiresAt, clearSession])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    applyAuthState(data?.user, data?.token, data?.sessionExpiresAt)
    return data
  }, [applyAuthState])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors: local session must still be cleared.
    }

    clearSession()
  }, [clearSession])

  const refreshMe = useCallback(async () => {
    const response = await api.get('/auth/me')
    const me = normalizeMePayload(response.data)

    if (me) {
      applyAuthState(me, undefined, sessionExpiresAt)
      return me
    }

    clearSession()
    return null
  }, [applyAuthState, clearSession, sessionExpiresAt])

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isInitializing,
    authLoading: isInitializing,
    login,
    logout,
    refreshMe,
    refreshAuth: refreshMe,
    setUser: (nextUser) => applyAuthState(nextUser),
  }), [user, isAuthenticated, isInitializing, login, logout, refreshMe, applyAuthState])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
