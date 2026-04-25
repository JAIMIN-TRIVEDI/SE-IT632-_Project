import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { services } from './data'

function StudentServicesCard() {
  return (
    <Card
      sx={{
        flex: 1.1,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography fontWeight={800} fontSize={16} color="text.primary">
            Services
          </Typography>
          <Typography fontSize={12} color="text.secondary" mt={0.3}>
            Quick booking
          </Typography>
        </Box>
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Box
              key={service.title}
              sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderTop: '1px solid',
                borderTopColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : '#fafbff',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  flexShrink: 0,
                  bgcolor: service.bg,
                  color: service.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Box>
              <Box flex={1}>
                <Typography fontSize={14} fontWeight={700} color="text.primary">
                  {service.title}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {service.desc}
                </Typography>
              </Box>
              <Button
                size="small"
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  color: service.color,
                  bgcolor: service.bg,
                  px: 1.8,
                  borderRadius: 2,
                  '&:hover': { bgcolor: service.color + '20' },
                }}
              >
                Book
              </Button>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default StudentServicesCard
