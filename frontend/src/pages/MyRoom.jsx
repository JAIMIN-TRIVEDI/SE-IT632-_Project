import React from 'react'
import { Box } from '@mui/material'
import RoomCard from '../components/dashboard/student/myroom/RoomCard'
import RoomDetails from '../components/dashboard/student/myroom/RoomDetails'
import RoommatesSection from '../components/dashboard/student/myroom/RoommatesSection'
import RoomPoliciesCard from '../components/dashboard/student/myroom/RoomPoliciesCard'
import LocationCard from '../components/dashboard/student/myroom/LocationCard'
import VacateRequestCard from '../components/dashboard/student/myroom/VacateRequestCard'

function MyRoom() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
        {/* Left Column - Main Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <RoomCard />
          <RoomDetails />
          <RoommatesSection />
        </Box>

        {/* Right Column - Sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <RoomPoliciesCard />
          <LocationCard />
          <VacateRequestCard />
        </Box>
      </Box>
    </Box>
  )
}

export default MyRoom
