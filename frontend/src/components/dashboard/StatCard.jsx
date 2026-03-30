import { Box, LinearProgress, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import DashboardCard from './DashboardCard.jsx'

function StatCard({ icon: Icon, label, value, badge, badgeTrend, extra, progress, iconBg, iconColor }) {
  const isUp = badgeTrend === 'up'
  return (
    <DashboardCard sx={{ flex: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: (theme) => {
              if (theme.palette.mode === 'dark') {
                return alpha(iconColor || theme.palette.primary.main, 0.2)
              }
              return iconBg || alpha(theme.palette.primary.main, 0.12)
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: (theme) => iconColor || theme.palette.primary.main,
          }}
        >
          <Icon />
        </Box>
        {badge && (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: (theme) => (isUp ? theme.palette.success.main : theme.palette.error.main),
            }}
          >
            {isUp ? '+' : '-'}
            {badge}
          </Typography>
        )}
        {extra && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{extra}</Typography>}
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5, mb: 0.5 }}>{label}</Typography>
      <Typography variant="h4" fontWeight={700} sx={{ mb: progress ? 1 : 0 }}>
        {value}
      </Typography>
      {typeof progress === 'number' && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'divider',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'primary.main',
              borderRadius: 3,
            },
          }}
        />
      )}
    </DashboardCard>
  )
}

export default StatCard
