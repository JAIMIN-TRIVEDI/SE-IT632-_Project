import { Avatar, Box, Button, Card, CardContent, Typography } from '@mui/material'
import { PersonAdd } from '@mui/icons-material'
import { roommates } from './data'

function StudentRoommatesCard() {
  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box>
            <Typography fontWeight={800} fontSize={16} color="#0f172a">
              Roommates
            </Typography>
            <Typography fontSize={12} color="#94a3b8" mt={0.2}>
              Room A-204 · 3 members
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<PersonAdd sx={{ fontSize: '14px !important' }} />}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              fontWeight: 700,
              color: '#6366f1',
              bgcolor: '#e0e7ff',
              borderRadius: 2,
              px: 1.5,
              '&:hover': { bgcolor: '#c7d2fe' },
            }}
          >
            Add
          </Button>
        </Box>
        {roommates.map((mate, i) => (
          <Box
            key={mate.name}
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderBottom: i < roommates.length - 1 ? '1px solid #f8fafc' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#fafbff',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: mate.bg,
                color: mate.color,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {mate.initials}
            </Avatar>
            <Box flex={1}>
              <Typography fontSize={13} fontWeight={700} color="#0f172a">
                {mate.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.7} mt={0.3}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: mate.status === 'In hostel' ? '#22c55e' : '#f59e0b',
                  }}
                />
                <Typography fontSize={11} color="#64748b">
                  {mate.status}
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                borderColor: '#e2e8f0',
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                '&:hover': {
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  bgcolor: '#e0e7ff',
                },
              }}
            >
              Message
            </Button>
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}

export default StudentRoommatesCard
