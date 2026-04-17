import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Button, Alert, Skeleton, Snackbar } from '@mui/material'
import { AddTask, RestaurantMenu } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import StatCard from '../components/mess/StatCard'
import RevenueChart from '../components/mess/RevenueChart'
import RecentActivity from '../components/mess/RecentActivity'

function MessAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const navigate = useNavigate()

  const fetchDashboard = async () => {
    try {
      setError('')
      setLoading(true)
      const response = await api.get('/mess/dashboard/stats')
      setDashboardData(response.data?.data || null)
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load dashboard data.'
      setError(message)
      setToastOpen(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const stats = [
    {
      title: 'Active Subscriptions',
      value: dashboardData?.totalActiveSubscriptions ?? '-',
      change: '+12%',
    },
    {
      title: 'Total Mess Plans',
      value: dashboardData?.totalPlans ?? '-',
      change: 'Updated',
    },
    {
      title: 'Monthly Revenue',
      value: dashboardData ? `₹${dashboardData.monthlyRevenue}` : '-',
      change: '+8%',
    },
    {
      title: 'Pending Refunds',
      value: dashboardData?.pendingRefundsCount ?? 0,
      change: 'Review',
      warning: true,
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Mess Dashboard Overview
          </Typography>
          <Typography color="text.secondary">
            Monitor mess subscriptions, revenue, and administrator actions.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddTask />}
            onClick={() => navigate('/mess-admin/plans')}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Create Plan
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestaurantMenu />}
            onClick={() => navigate('/mess-admin/menu')}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Update Menu
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchDashboard}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading ? (
        <>
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} sx={{ flex: 1, minWidth: 220 }}>
                <Skeleton variant="rounded" height={124} />
              </Box>
            ))}
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={2} minWidth={300}>
              <Skeleton variant="rounded" height={280} />
            </Box>
            <Box flex={1} minWidth={260}>
              <Skeleton variant="rounded" height={280} />
            </Box>
          </Box>
        </>
      ) : !dashboardData ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="text.secondary" mb={2}>No dashboard data available.</Typography>
          <Button variant="outlined" onClick={fetchDashboard} sx={{ textTransform: 'none' }}>Reload</Button>
        </Box>
      ) : (
        <>
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                warning={stat.warning}
              />
            ))}
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex={2} minWidth={300}>
              <RevenueChart />
            </Box>
            <Box flex={1} minWidth={260}>
              <RecentActivity />
            </Box>
          </Box>
        </>
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }} onClose={() => setToastOpen(false)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MessAdminDashboard