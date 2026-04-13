import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Button } from '@mui/material'
import { AddTask, RestaurantMenu } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import StatCard from '../components/mess/StatCard'
import RevenueChart from '../components/mess/RevenueChart'
import RecentActivity from '../components/mess/RecentActivity'

function MessAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/reports/mess')
        setDashboardData(response.data.data)
      } catch (err) {
        console.error('Mess dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const stats = [
    {
      title: 'Active Subscriptions',
      value: dashboardData?.activeSubscriptions ?? '-',
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
      value: dashboardData?.pendingRefundRequests ?? 0,
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
            sx={{ textTransform: 'none' }}
          >
            Create Plan
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestaurantMenu />}
            onClick={() => navigate('/mess-admin/menu')}
            sx={{ textTransform: 'none' }}
          >
            Update Menu
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="55vh">
          <CircularProgress />
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
    </Box>
  )
}

export default MessAdminDashboard