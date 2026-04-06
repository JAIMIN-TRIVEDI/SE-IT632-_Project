import { useState, useEffect, useCallback } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import StudentSidebarNav from '../components/dashboard/student/StudentSidebarNav.jsx'
import StudentTopBar from '../components/dashboard/student/StudentTopBar.jsx'
import StudentStatusCards from '../components/dashboard/student/StudentStatusCards.jsx'
import StudentRecentNotifications from '../components/dashboard/student/StudentRecentNotifications.jsx'
import StudentQuickActions from '../components/dashboard/student/StudentQuickActions.jsx'
import MyRoom from './MyRoom.jsx'
import Payments from './Payments.jsx'
import MessMenu from './MessMenu.jsx'
import ApplyMessPlan from './ApplyMessPlan.jsx'
import StudentProfile from './StudentProfile.jsx'
import StudentComplaints from './StudentComplaints.jsx'
import StudentNotifications from './StudentNotifications.jsx'
import api from '../api/api'

function StudentDashboard({ mode = 'light', onToggleTheme }) {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async ({ preserveError = false } = {}) => {
    try {
      const response = await api.get('/user/student/dashboard')
      setDashboardData(response.data.data)
      if (!preserveError) {
        setError(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    setSearchQuery('')
  }, [activeNav])

  const getSearchPlaceholder = () => {
    switch (activeNav) {
      case 'Payments':
      case 'Payment History':
        return 'Search payments by type, status, or amount...'
      case 'My Room':
        return 'Search roommates or room details...'
      case 'Complaints':
        return 'Search complaints by category or status...'
      case 'Notifications':
        return 'Search notifications...'
      case 'Mess Subscription':
        return 'Search mess plans...'
      default:
        return 'Search notices, services...'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    )
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'My Room':
        return (
          <MyRoom
            dashboardData={dashboardData}
            searchQuery={searchQuery}
            onVacateRequested={() => fetchDashboard({ preserveError: true })}
          />
        )
      case 'Payments':
        return <Payments payments={dashboardData?.payments || []} searchQuery={searchQuery} />
      case 'Payment History':
        return <Payments payments={dashboardData?.payments || []} searchQuery={searchQuery} />
      case 'Mess Menu':
        return <MessMenu />
      case 'Mess Subscription':
        return <ApplyMessPlan />
      case 'Complaints':
        return <StudentComplaints searchQuery={searchQuery} />
      case 'Notifications':
        return <StudentNotifications searchQuery={searchQuery} />
      case 'Profile':
        return (
          <StudentProfile
            initialUser={dashboardData?.user}
            onProfileUpdated={(updated) => {
              setDashboardData((prev) => prev ? { ...prev, user: { ...prev.user, ...updated } } : prev)
            }}
          />
        )
      case 'Dashboard':
      default:
        return (
          <>
            <StudentStatusCards dashboardData={dashboardData} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
              <StudentRecentNotifications
                notifications={dashboardData?.notifications || []}
                searchQuery={searchQuery}
                onViewAllNotifications={() => setActiveNav('Notifications')}
              />
              <StudentQuickActions searchQuery={searchQuery} onActionSelect={setActiveNav} />
            </Box>
          </>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <StudentSidebarNav activeNav={activeNav} onSelect={setActiveNav} user={dashboardData?.user} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <StudentTopBar
          activeNav={activeNav}
          user={dashboardData?.user}
          room={dashboardData?.room}
          mode={mode}
          onToggleTheme={onToggleTheme}
          searchQuery={searchQuery}
          searchPlaceholder={getSearchPlaceholder()}
          onSearchChange={setSearchQuery}
          onProfileClick={() => setActiveNav('Profile')}
        />
        <Box sx={{ px: 4, pb: 4, pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default StudentDashboard