import { Box, Card, CardContent, Chip, Typography } from '@mui/material'
import { CheckCircle, AccessTime } from '@mui/icons-material'
import { todaySchedule } from './data'

function StudentScheduleCard() {
  return (
    <Card
      sx={{
        flex: 1.1,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Typography fontWeight={800} fontSize={16} color="#0f172a">
            Today's Schedule
          </Typography>
          <Chip
            label="Live"
            size="small"
            sx={{
              bgcolor: '#dcfce7',
              color: '#16a34a',
              fontWeight: 700,
              fontSize: 11,
              '& .MuiChip-label': { px: 1.2 },
            }}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {todaySchedule.map((item) => (
            <Box
              key={item.time}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: item.done ? '#f8fafc' : '#fff',
                border: '1.5px solid',
                borderColor: item.done ? '#e2e8f0' : '#e0e7ff',
                opacity: item.done ? 0.65 : 1,
              }}
            >
              {item.done ? (
                <CheckCircle sx={{ color: '#22c55e', fontSize: 18, flexShrink: 0 }} />
              ) : (
                <AccessTime sx={{ color: '#6366f1', fontSize: 18, flexShrink: 0 }} />
              )}
              <Box flex={1}>
                <Typography
                  fontSize={13}
                  fontWeight={700}
                  color="#0f172a"
                  sx={{ textDecoration: item.done ? 'line-through' : 'none' }}
                >
                  {item.title}
                </Typography>
                <Typography fontSize={11} color="#94a3b8">
                  {item.location}
                </Typography>
              </Box>
              <Typography fontSize={11} fontWeight={600} color={item.done ? '#94a3b8' : '#6366f1'}>
                {item.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default StudentScheduleCard
