import { CssBaseline, ThemeProvider } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

import getTheme from './styles/theme.js'
import './styles/app.css'

import AdminDashboard from './pages/AdminDashboard.jsx'
import WardenDashboard from './pages/WardenDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

function App() {
  const [mode, setMode] = useState('light')

  useEffect(() => {
    const storedMode = localStorage.getItem('color-mode')
    if (storedMode === 'light' || storedMode === 'dark') {
      setMode(storedMode)
    }
  }, [])

  const theme = useMemo(() => getTheme(mode), [mode])

  const handleToggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('color-mode', next)
      return next
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RootLayout>
                <LandingPage mode={mode} onToggleTheme={handleToggleTheme} />
              </RootLayout>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard/hostel-admin" element={<AdminDashboard />} />
          <Route path="/dashboard/warden" element={<WardenDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
