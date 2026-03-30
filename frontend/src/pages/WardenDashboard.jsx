import { useState } from 'react'
import { Box } from '@mui/material'
import WardenSidebarNav from '../components/dashboard/warden/WardenSidebarNav.jsx'
import WardenTopBar from '../components/dashboard/warden/WardenTopBar.jsx'
import WardenStatCard from '../components/dashboard/warden/WardenStatCard.jsx'
import WardenActivityTableCard from '../components/dashboard/warden/WardenActivityTableCard.jsx'
import WardenAnnouncementsCard from '../components/dashboard/warden/WardenAnnouncementsCard.jsx'
import WardenAvailabilityCard from '../components/dashboard/warden/WardenAvailabilityCard.jsx'
import { stats } from '../components/dashboard/warden/data'

function WardenDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <WardenSidebarNav activeNav={activeNav} onSelect={setActiveNav} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <WardenTopBar />
        <Box sx={{ px: 4, pb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box display="flex" gap={2.5}>
            {stats.map((stat) => (
              <WardenStatCard key={stat.label} {...stat} />
            ))}
          </Box>
          <Box display="flex" gap={2.5} alignItems="flex-start">
            <WardenActivityTableCard />
            <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
              <WardenAnnouncementsCard />
              <WardenAvailabilityCard />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default WardenDashboard
