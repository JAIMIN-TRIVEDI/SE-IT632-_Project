import { Box, Typography } from '@mui/material'
import MessSidebar from '../components/mess/MessSidebar'
import MessTopbar from '../components/mess/MessTopbar'
import StatCard from '../components/mess/StatCard'
import RevenueChart from '../components/mess/RevenueChart'
import RecentActivity from '../components/mess/RecentActivity'

function MessAdminDashboard() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f6f8fb' }}>
      
      {/* Sidebar */}
      <MessSidebar />

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <MessTopbar />

        {/* Content */}
        <Box sx={{ p: 3 }}>

          {/* Title */}
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Mess Dashboard Overview
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Monitor mess subscriptions, revenue, and attendance.
          </Typography>

          {/* Stats */}
          <Box display="flex" gap={2} mb={3}>
            <StatCard title="Total Active Subscriptions" value="850" change="+12%" />
            <StatCard title="Today's Attendance" value="620" change="+5%" />
            <StatCard title="Monthly Revenue" value="$18,450" change="-2%" />
            <StatCard title="Expiring Soon" value="45" change="Action Needed" />
          </Box>

          {/* Bottom Layout */}
          <Box display="flex" gap={2}>

            {/* Chart */}
            <Box flex={2}>
              <RevenueChart />
            </Box>

            {/* Activity */}
            <Box flex={1}>
              <RecentActivity />
            </Box>

          </Box>

        </Box>
      </Box>
    </Box>
  )
}

export default MessAdminDashboard