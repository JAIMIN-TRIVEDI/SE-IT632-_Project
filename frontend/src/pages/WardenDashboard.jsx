import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import WardenSidebarNav from '../components/dashboard/warden/WardenSidebarNav.jsx'
import WardenTopBar from '../components/dashboard/warden/WardenTopBar.jsx'
import WardenStatCard from '../components/dashboard/warden/WardenStatCard.jsx'
import WardenActivityTableCard from '../components/dashboard/warden/WardenActivityTableCard.jsx'
import WardenAnnouncementsCard from '../components/dashboard/warden/WardenAnnouncementsCard.jsx'
import WardenAvailabilityCard from '../components/dashboard/warden/WardenAvailabilityCard.jsx'
import WardenRooms from './warden/WardenRooms.jsx'
import WardenComplaints from './warden/WardenComplaints.jsx'
import WardenStudents from './warden/WardenStudents.jsx'
import WardenProfile from './warden/WardenProfile.jsx'
import StudentNotifications from './StudentNotifications.jsx'
import api from '../api/api'

function WardenDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports/dashboard/warden')
      setDashboardData(res.data?.data || {})
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load warden dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    setSearchQuery('')
  }, [activeNav])

  const getSearchPlaceholder = () => {
    switch (activeNav) {
      case 'Rooms':
        return 'Search hostels, blocks, or room statuses...'
      case 'Complaints':
        return 'Search complaints by student, room or category...'
      case 'Students':
        return 'Search students by name, hostel or room...'
      case 'Notifications':
        return 'Search alerts and updates...'
      case 'Profile':
        return 'Search profile fields...'
      default:
        return 'Search student or room...'
    }
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'Rooms':
        return <WardenRooms searchQuery={searchQuery} />
      case 'Complaints':
        return <WardenComplaints searchQuery={searchQuery} />
      case 'Students':
        return <WardenStudents searchQuery={searchQuery} />
      case 'Notifications':
        return <StudentNotifications searchQuery={searchQuery} />
      case 'Profile':
        return <WardenProfile />
      case 'Dashboard':
      default:
        return (
          <>
            <Box display="flex" gap={2.5} flexWrap="wrap">
              {stats.map((stat) => (
                <WardenStatCard key={stat.label} {...stat} />
              ))}
            </Box>
            <Box display="flex" gap={2.5} alignItems="flex-start" flexWrap="wrap">
              <WardenActivityTableCard sx={{ minWidth: 360, flex: 2 }} />
              <Box flex={1} display="flex" flexDirection="column" gap={2.5} sx={{ minWidth: 320 }}>
                <WardenAnnouncementsCard />
                <WardenAvailabilityCard />
              </Box>
            </Box>
          </>
        )
    }
  }

  const stats = useMemo(() => {
    if (!dashboardData) return []
    return [
      {
        label: 'Total Rooms',
        value: `${dashboardData.rooms ?? 0}`,
        sub: 'Rooms under management',
        badge: 'Stable',
        badgeTrend: 'up',
        iconEmoji: '🏠',
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
      },
      {
        label: 'Pending Complaints',
        value: `${dashboardData.complaints ?? 0}`,
        sub: 'Need your attention',
        badge: 'Updated',
        badgeTrend: 'up',
        icon: null,
        iconEmoji: '⚠️',
        iconBg: '#fef2f2',
        iconColor: '#dc2626',
      },
      {
        label: 'Students On-leave',
        value: '24',
        sub: 'Expected return: tomorrow',
        badge: '5%',
        badgeTrend: 'down',
        icon: null,
        iconEmoji: '✈️',
        iconBg: '#fff7ed',
        iconColor: '#ea580c',
      },
    ]
  }, [dashboardData])

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <WardenSidebarNav activeNav={activeNav} onSelect={setActiveNav} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <WardenTopBar
          activeNav={activeNav}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={getSearchPlaceholder()}
        />
        <Box sx={{ px: 4, pb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default WardenDashboard
