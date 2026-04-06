import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Chip, Button, Stack } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import RoomImage from '../../../../assets/images/room_image.jpg'
export default function RoomCard({ room }) {
  const navigate = useNavigate()
  const roomNumber = room?.roomNumber || 'N/A'
  const roomFloor = roomNumber?.split('-')?.[0] || 'N/A'
  const status = room?.status ? `${room.status.charAt(0).toUpperCase() + room.status.slice(1)}` : 'Assigned'

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%), url(${RoomImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: 350,
        display: 'flex',
        alignItems: 'flex-end',
        p: 3,
      }}
    >
      <Box sx={{ color: 'white', zIndex: 1, width: '100%' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            opacity: 0.8,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
          }}
        >
          📍 FLOOR {roomFloor}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            fontSize: '2rem',
            mt: 0.5,
          }}
        >
          Room {roomNumber}
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/student/apply-room')}
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            mt: 2.5,
            alignSelf: 'flex-start',
            bgcolor: 'rgba(255,255,255,0.14)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: 999,
            px: 2.25,
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'rgba(37, 99, 235, 0.92)',
              borderColor: 'rgba(255,255,255,0.18)',
              boxShadow: 'none',
            },
          }}
        >
          Apply for Room
        </Button>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, opacity: 0.9 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.82)' }}>
            Opens room request flow
          </Typography>
        </Stack>
      </Box>

      <Chip
        label={`● ${status}`}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          bgcolor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          fontWeight: 600,
          fontSize: '0.75rem',
          zIndex: 1,
        }}
      />
    </Box>
  )
}
