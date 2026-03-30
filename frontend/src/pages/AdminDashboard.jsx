import { useState } from 'react'
import { Box } from '@mui/material'
import SidebarNav from '../components/dashboard/SidebarNav.jsx'
import TopBar from '../components/dashboard/TopBar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import StatsGrid from '../components/dashboard/StatsGrid.jsx'
import RevenueChartCard from '../components/dashboard/RevenueChartCard.jsx'
import RecentActivityCard from '../components/dashboard/RecentActivityCard.jsx'
import PendingFeesCard from '../components/dashboard/PendingFeesCard.jsx'
import HostelsView from '../components/dashboard/admin/HostelsView.jsx'

function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  const renderContent = () => {
    switch (activeNav) {
      case 'Hostels':
        return <HostelsView />
      case 'Dashboard':
      default:
        return (
          <>
            <DashboardHeader />
            <StatsGrid />
            <Box display="flex" gap={2} mb={3}>
              <RevenueChartCard />
              <RecentActivityCard />
            </Box>
            <PendingFeesCard />
          </>
        )
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
