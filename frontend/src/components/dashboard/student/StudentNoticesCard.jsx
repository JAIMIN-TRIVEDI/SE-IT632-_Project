import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { notices } from './data'

function StudentNoticesCard() {
  return (
    <Card
      sx={{
        flex: 0.9,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box>
            <Typography fontWeight={800} fontSize={16} color="text.primary">
              Notices
            </Typography>
            <Typography fontSize={12} color="text.secondary" mt={0.2}>
              Latest updates
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ChevronRight />}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              fontWeight: 600,
              color: '#6366f1',
            }}
          >
            All
          </Button>
        </Box>
        <Box display="flex" flexDirection="column" gap={2}>
          {notices.map((notice) => (
            <Box
              key={notice.title}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1.5px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#e0e7ff',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : '#fafbff',
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                <Typography fontSize={13} fontWeight={700} color="text.primary" flex={1} pr={1}>
                  {notice.title}
                </Typography>
                <Chip
                  label={notice.tag}
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 20,
                    bgcolor: notice.tagBg,
                    color: notice.tagColor,
                    fontWeight: 700,
                    flexShrink: 0,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Box>
              <Typography fontSize={12} color="text.secondary" lineHeight={1.5}>
                {notice.desc}
              </Typography>
              <Typography fontSize={11} color="text.secondary" mt={0.5}>
                {notice.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default StudentNoticesCard
