import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, Typography } from '@mui/material'
import RoomCard from '../components/dashboard/student/myroom/RoomCard'
import RoomDetails from '../components/dashboard/student/myroom/RoomDetails'
import RoommatesSection from '../components/dashboard/student/myroom/RoommatesSection'
import RoomPoliciesCard from '../components/dashboard/student/myroom/RoomPoliciesCard'
import LocationCard from '../components/dashboard/student/myroom/LocationCard'
import VacateRequestCard from '../components/dashboard/student/myroom/VacateRequestCard'

function MyRoom({ dashboardData }) {
  const navigate = useNavigate()
  const room = dashboardData?.room
  const request = dashboardData?.roomRequest
  const roommates = dashboardData?.roommates || []

  const roomAssigned = Boolean(room)

  const requestStatus = useMemo(() => {
    if (!request) return null
    return `${request.status.charAt(0).toUpperCase() + request.status.slice(1)} / ${request.paymentStatus.charAt(0).toUpperCase() + request.paymentStatus.slice(1)}`
  }, [request])

  if (!roomAssigned) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            No room assigned yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You do not have an assigned room yet. Please request a room and complete payment to get assigned.
          </Typography>
          {request ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Current request status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {requestStatus}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Requested type: {request.roomType ? request.roomType.toUpperCase() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Requested amount: ₹{request.amount?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          ) : null}
          <Button variant="contained" onClick={() => navigate('/student/apply-room')}>
            Request a Room
          </Button>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <RoomCard room={room} />
      </Card>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <RoomDetails room={room} />
          <RoommatesSection roommates={roommates} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <RoomPoliciesCard />
          <LocationCard room={room} />
          <VacateRequestCard />
        </Box>
      </Box>
    </Box>
  )
}

export default MyRoom
