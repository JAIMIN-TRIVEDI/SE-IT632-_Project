import { useState } from 'react'
import { Box } from '@mui/material'
import StudentSidebarNav from '../components/dashboard/student/StudentSidebarNav.jsx'
import StudentTopBar from '../components/dashboard/student/StudentTopBar.jsx'
import StudentStatusCards from '../components/dashboard/student/StudentStatusCards.jsx'
import StudentRecentNotifications from '../components/dashboard/student/StudentRecentNotifications.jsx'
import StudentQuickActions from '../components/dashboard/student/StudentQuickActions.jsx'
import MyRoom from './MyRoom.jsx'
import Payments from './Payments.jsx'

function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  // Render different content based on active navigation
  const renderContent = () => {
    switch (activeNav) {
      case 'My Room':
        return <MyRoom />
      case 'Payments':
        return <Payments />
      case 'Dashboard':
      default:
        return (
          <>
            {/* Status Cards */}
            <StudentStatusCards />

            {/* Notifications + Quick Actions */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
              <StudentRecentNotifications />
              <StudentQuickActions />
            </Box>
          </>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <StudentSidebarNav activeNav={activeNav} onSelect={setActiveNav} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <StudentTopBar activeNav={activeNav} />
        <Box sx={{ px: 4, pb: 4, pt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default StudentDashboard
