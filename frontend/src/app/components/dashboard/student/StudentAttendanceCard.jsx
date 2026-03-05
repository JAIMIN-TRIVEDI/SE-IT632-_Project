import { Box, Card, CardContent, Typography } from '@mui/material'
import { attendanceData } from './data.js'

function StudentAttendanceCard() {
  return (
    <Card
      sx={{
        flex: 0.9,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography fontWeight={800} fontSize={16} color="#0f172a" mb={0.5}>
          Weekly Attendance
        </Typography>
        <Typography fontSize={12} color="#94a3b8" mb={2.5}>
          This week's overview
        </Typography>

        {/* Big number */}
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography fontSize={34} fontWeight={900} color="#fff" lineHeight={1}>
              86%
            </Typography>
            <Typography fontSize={12} color="rgba(255,255,255,0.7)" mt={0.3}>
              Overall present
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography fontSize={13} fontWeight={700} color="#a5b4fc">
              19 / 22
            </Typography>
            <Typography fontSize={11} color="rgba(255,255,255,0.5)">
              days
            </Typography>
          </Box>
        </Box>

        {/* Day bars */}
        <Box display="flex" gap={0.8} alignItems="flex-end">
          {attendanceData.map((d) => (
            <Box
              key={d.day}
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={0.5}
            >
              <Box
                sx={{
                  width: '100%',
                  height: 42,
                  borderRadius: 1.5,
                  background:
                    d.val === 100
                      ? 'linear-gradient(180deg, #6366f1, #8b5cf6)'
                      : d.val === 50
                      ? 'linear-gradient(180deg, #fbbf24, #f59e0b)'
                      : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: `${d.val}%`,
                    borderRadius: 1.5,
                    background:
                      d.val === 100
                        ? 'transparent'
                        : d.val === 50
                        ? 'transparent'
                        : 'transparent',
                  }}
                />
              </Box>
              <Typography fontSize={10} fontWeight={600} color="#94a3b8">
                {d.day}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default StudentAttendanceCard
