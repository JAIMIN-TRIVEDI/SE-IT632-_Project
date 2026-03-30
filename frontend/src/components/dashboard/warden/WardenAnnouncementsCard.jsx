import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import DashboardCard from '../DashboardCard.jsx'
import { announcements } from './data'

function WardenAnnouncementsCard() {
  return (
    <DashboardCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Announcements
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          New
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {announcements.map((item) => {
          const Icon = item.icon
          return (
            <Box key={item.title} display="flex" gap={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(item.iconColor, 0.2)
                      : item.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 18, color: item.iconColor }} />
              </Box>
              <Box>
                <Typography fontSize={13} fontWeight={700} color="text.primary">
                  {item.title}
                </Typography>
                <Typography fontSize={12} color="text.secondary" lineHeight={1.5}>
                  {item.desc}
                </Typography>
                <Typography fontSize={11} color="text.secondary" mt={0.3}>
                  {item.time}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </DashboardCard>
  )
}

export default WardenAnnouncementsCard
