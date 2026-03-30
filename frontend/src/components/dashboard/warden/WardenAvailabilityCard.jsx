import { Box, LinearProgress, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Add } from '@mui/icons-material'
import DashboardCard from '../DashboardCard.jsx'
import { availability } from './data'

function WardenAvailabilityCard() {
  return (
    <DashboardCard sx={{ position: 'relative' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Availability
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {availability.map((item) => (
          <Box key={item.label}>
            <Box display="flex" justifyContent="space-between" mb={0.8}>
              <Typography fontSize={13} fontWeight={500} color="text.primary">
                {item.label}
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                {item.current}/{item.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(item.current / item.total) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'divider',
                '& .MuiLinearProgress-bar': {
                  bgcolor: item.color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.5)'
              : '0 4px 12px rgba(37,99,235,0.4)',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <Add />
      </Box>
    </DashboardCard>
  )
}

export default WardenAvailabilityCard
