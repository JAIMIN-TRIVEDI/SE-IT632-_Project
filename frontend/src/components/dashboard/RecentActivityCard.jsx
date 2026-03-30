import { Box, Button, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { recentActivities } from '../../constants/data'
import DashboardCard from './DashboardCard.jsx'

function RecentActivityCard() {
  const theme = useTheme()
  return (
    <DashboardCard sx={{ flex: 1 }}>
      <Typography fontWeight={700} fontSize={16} color="text.primary" mb={0.5}>
        Recent Activity
      </Typography>
      <Typography fontSize={13} color="text.secondary" mb={2}>
        Latest registrations & payments
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        {recentActivities.map((activity, index) => {
          const Icon = activity.icon
          const iconBg =
            theme.palette.mode === 'dark' ? alpha(activity.color, 0.2) : activity.bg
          return (
            <Box key={index} display="flex" alignItems="flex-start" gap={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: iconBg,
                  color: activity.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Box>
                <Typography fontSize={13} fontWeight={600} color="text.primary">
                  {activity.name}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {activity.action}
                </Typography>
                <Typography fontSize={11} color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
      <Button
        sx={{
          mt: 2,
          color: 'primary.main',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 13,
          p: 0,
          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
        }}
      >
        View All Activity
      </Button>
    </DashboardCard>
  )
}

export default RecentActivityCard
