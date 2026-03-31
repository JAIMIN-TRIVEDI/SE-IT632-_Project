import { useState, useEffect } from 'react'
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
import api from '../api/api'

function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/user/student/dashboard')
        setDashboardData(response.data.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

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
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    )
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'My Room':
        return <MyRoom dashboardData={dashboardData} />
      case 'Payments':
        return <Payments payments={dashboardData?.payments || []} />
      case 'Mess Menu':
        return <MessMenu />
      case 'Mess Plan':
        return <ApplyMessPlan />
      case 'Dashboard':
      default:
        return (
          <>
            {/* Status Cards */}
            <StudentStatusCards dashboardData={dashboardData} />

            {/* Notifications + Quick Actions */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
              <StudentRecentNotifications notifications={dashboardData.notifications} />
              <StudentQuickActions />
            </Box>
          </>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <StudentSidebarNav activeNav={activeNav} onSelect={setActiveNav} user={dashboardData?.user} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <StudentTopBar activeNav={activeNav} user={dashboardData?.user} room={dashboardData?.room} />
        <Box sx={{ px: 4, pb: 4, pt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default StudentDashboard
