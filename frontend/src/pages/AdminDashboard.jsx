import { useState, useEffect } from 'react'
import { Alert, Box, CircularProgress } from '@mui/material'
import SidebarNav from '../components/dashboard/SidebarNav.jsx'
import TopBar from '../components/dashboard/TopBar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import StatsGrid from '../components/dashboard/StatsGrid.jsx'
import RevenueChartCard from '../components/dashboard/RevenueChartCard.jsx'
import RecentActivityCard from '../components/dashboard/RecentActivityCard.jsx'
import PendingFeesCard from '../components/dashboard/PendingFeesCard.jsx'
import HostelsView from '../components/dashboard/admin/HostelsView.jsx'
import StudentsView from '../components/dashboard/admin/StudentsView.jsx'
import PaymentsView from '../components/dashboard/admin/payments/PaymentsView.jsx'
import ReportsView from '../components/dashboard/admin/ReportsView.jsx'
import NotificationsView from '../components/dashboard/admin/NotificationsView.jsx'
import api from '../api/api'

function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Hostels')

  // ✅ REAL DATA STATE
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ✅ FETCH ADMIN DASHBOARD DATA
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError('')
        const endpoint = '/reports/dashboard/admin'
        const res = await api.get(endpoint)
        setDashboardData(res.data.data)
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load admin dashboard data.'
        setError(message)
        console.error('Dashboard fetch error:', {
          message,
          status: err.response?.status,
          endpoint: '/reports/dashboard/admin',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const renderContent = () => {
    switch (activeNav) {
      case 'Hostels':
        return <HostelsView />

      case 'Students':
        return <StudentsView />

      case 'Payments':
        return <PaymentsView />

      case 'Reports':
        return <ReportsView />

      case 'Notifications':
        return <NotificationsView />

      case 'Dashboard':
        // return <HostelsView />
      default:
        if (loading) {
          return (
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
              <CircularProgress />
            </Box>
          )
        }

        if (error) {
          return <Alert severity="error">{error}</Alert>
        }

       return <HostelsView />
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SidebarNav activeNav={activeNav} onSelect={setActiveNav} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />

        <Box sx={{ p: 3, flexGrow: 1 }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default AdminDashboard