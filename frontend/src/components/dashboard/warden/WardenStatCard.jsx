import { Box, LinearProgress, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import DashboardCard from '../DashboardCard.jsx'

function WardenStatCard({ icon: Icon, iconEmoji, iconBg, iconColor, label, value, sub, badge, badgeTrend, progressValue }) {
  const showProgress = typeof progressValue === 'number'
  const isUp = badgeTrend === 'up'

  return (
    <DashboardCard sx={{ flex: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: (theme) => {
              if (theme.palette.mode === 'dark') {
                return alpha(iconColor || theme.palette.primary.main, 0.2)
              }
              return iconBg || alpha(theme.palette.primary.main, 0.12)
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor || 'primary.main',
            fontSize: 20,
          }}
        >
          {Icon ? <Icon fontSize="small" /> : <span>{iconEmoji}</span>}
        </Box>
        {badge && (
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: (theme) => (isUp ? theme.palette.success.main : theme.palette.error.main),
            }}
          >
            {isUp ? '+' : '-'}
            {badge}
          </Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>{sub}</Typography>}
      {showProgress && (
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            mt: 1.5,
            height: 5,
            borderRadius: 3,
            bgcolor: 'divider',
            '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 },
          }}
        />
      )}
    </DashboardCard>
  )
}

export default WardenStatCard
