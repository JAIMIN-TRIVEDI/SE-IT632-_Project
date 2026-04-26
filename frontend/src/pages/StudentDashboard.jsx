import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, CircularProgress, Skeleton, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
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

const STUDENT_BASE_PATH = '/student/dashboard'
const STUDENT_SECTION_TO_PATH = {
  Dashboard: '',
  'My Room': 'my-room',
  'Mess Subscription': 'mess-subscription',
  'Mess Menu': 'mess-menu',
  Payments: 'payments',
  Complaints: 'complaints',
  Notifications: 'notifications',
  Profile: 'profile',
}

const STUDENT_PATH_TO_SECTION = Object.fromEntries(
  Object.entries(STUDENT_SECTION_TO_PATH)
    .filter(([, slug]) => Boolean(slug))
    .map(([label, slug]) => [slug, label]),
)

const getStudentSectionFromPath = (pathname) => {
  const normalized = pathname.replace(/\/+$/, '')
  const segment = normalized.replace(/^\/student\/dashboard\/?/, '')
  if (!segment) return 'Dashboard'
  return STUDENT_PATH_TO_SECTION[segment] || 'Dashboard'
}

function StudentDashboard({ mode = 'light', onToggleTheme }) {
  const navigate = useNavigate()
  const location = useLocation()
  const activeNav = getStudentSectionFromPath(location.pathname)
  const [searchQuery, setSearchQuery] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navigateToSection = useCallback(
    (label) => {
      const slug = STUDENT_SECTION_TO_PATH[label]
      const nextPath = slug ? `${STUDENT_BASE_PATH}/${slug}` : STUDENT_BASE_PATH
      if (location.pathname !== nextPath) {
        navigate(nextPath)
      }
    },
    [location.pathname, navigate],
  )

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

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const handleOpenComplaintsChange = useCallback((openCount) => {
    setDashboardData((prev) => {
      if (!prev || prev.openComplaints === openCount) {
        return prev
      }
      return { ...prev, openComplaints: openCount }
    })
  }, [])

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
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rounded" height={64} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
          <Skeleton variant="rounded" height={280} />
          <Skeleton variant="rounded" height={280} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={() => fetchDashboard()}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" mb={1}>No dashboard data available</Typography>
        <Typography color="text.secondary" mb={2}>Please reload to fetch your latest data.</Typography>
        <Button variant="outlined" onClick={() => fetchDashboard()} sx={{ textTransform: 'none' }}>Reload</Button>
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
        return <Payments payments={dashboardData?.payments || []} searchQuery={searchQuery} renewal={dashboardData?.renewal || null} />
      case 'Payment History':
        return <Payments payments={dashboardData?.payments || []} searchQuery={searchQuery} renewal={dashboardData?.renewal || null} />
      case 'Mess Menu':
        return <MessMenu />
      case 'Mess Subscription':
        return <ApplyMessPlan />
      case 'Complaints':
        return (
          <StudentComplaints
            searchQuery={searchQuery}
            onOpenComplaintsChange={handleOpenComplaintsChange}
          />
        )
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
              <StudentRecentNotifications
                notifications={dashboardData?.notifications || []}
                searchQuery={searchQuery}
                  onViewAllNotifications={() => navigateToSection('Notifications')}
              />
              <StudentQuickActions searchQuery={searchQuery} onActionSelect={navigateToSection} />
            </Box>
          </>
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <StudentSidebarNav
        activeNav={activeNav}
        onSelect={navigateToSection}
        user={dashboardData?.user}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
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
          onProfileClick={() => navigateToSection('Profile')}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
        />
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 4, pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default StudentDashboard