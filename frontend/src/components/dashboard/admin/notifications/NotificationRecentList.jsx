import { Box, Chip, Stack, Typography } from '@mui/material'
import DashboardCard from '../../DashboardCard.jsx'

const audienceLabel = {
  student: 'Students',
  warden: 'Warden',
  both: 'Students + Warden',
}

function NotificationRecentList({ items }) {
  return (
    <DashboardCard>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Recent Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest messages sent by hostel admin.
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Box
            sx={{
              py: 5,
              borderRadius: 2,
              textAlign: 'center',
              border: (theme) => `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography fontWeight={700} color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sent notifications will appear here.
            </Typography>
          </Box>
        ) : null}

        <Stack spacing={1.5}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.75,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 1.5, mb: 0.75 }}>
                <Typography fontWeight={700}>{item.title || 'Notification'}</Typography>
                <Chip size="small" label={audienceLabel[item.audience] || 'Students'} />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
                {item.message}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Chip size="small" variant="outlined" label={`${item.recipientCount} recipients`} />
                <Chip size="small" variant="outlined" label={new Date(item.createdAt).toLocaleString()} />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </DashboardCard>
  )
}

export default NotificationRecentList
