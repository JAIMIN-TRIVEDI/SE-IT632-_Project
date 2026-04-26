import { Box, IconButton, Typography, Chip, Stack } from '@mui/material'
import { HomeWork, Edit, Delete } from '@mui/icons-material'
import DashboardCard from '../DashboardCard.jsx'

function HostelCard({ hostel, onEdit, onDelete }) {
  const blocks = Array.isArray(hostel.blocks) ? hostel.blocks : []
  const rooms = Array.isArray(hostel.rooms) ? hostel.rooms : []
  const totalBlocks = hostel.totalBlocks ?? blocks.length
  const totalRooms = hostel.totalRooms ?? blocks.reduce((acc, block) => acc + Number(block.totalRooms || 0), 0)
  const availableRooms = hostel.availableRooms ?? rooms.filter((room) => room.status === 'available').length
  const wardenName = hostel.wardenId?.name || 'Unassigned'
  const wardenEmail = hostel.wardenId?.email || ''

  const roomTypeSummary = [
    {
      key: 'double',
      label: 'Double',
      value: rooms.filter((room) => room.roomType === 'double').length,
    },
    {
      key: 'triple',
      label: 'Triple',
      value: rooms.filter((room) => room.roomType === 'triple').length,
    },
    {
      key: 'quad',
      label: 'Quad',
      value: rooms.filter((room) => room.roomType === 'quad').length,
    },
  ].filter((item) => item.value > 0)

  return (
    <DashboardCard
      contentSx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 12px 32px rgba(0,0,0,0.5)'
            : '0 12px 32px rgba(0,0,0,0.12)',
        },
      })}
    >
      {/* Header with Icon and Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
        <Box
          sx={{
            p: 1.8,
            borderRadius: 2.5,
            bgcolor: hostel.type === 'girl' ? 'rgba(219, 39, 119, 0.08)' : 'rgba(37, 99, 235, 0.08)',
            color: hostel.type === 'girl' ? '#db2777' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          <HomeWork />
        </Box>
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            onClick={() => onEdit(hostel)}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(hostel._id)}
            sx={{
              color: 'error.main',
              '&:hover': { bgcolor: 'error.lighter', opacity: 0.8 },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={700} noWrap title={hostel.name} sx={{ mb: 0.5, lineHeight: 1.3 }}>
        {hostel.name}
      </Typography>

      <Box display="flex" gap={1} mb={2} sx={{ flexWrap: 'wrap' }}>
        <Chip
          label={hostel.type === 'boy' ? 'Boys' : 'Girls'}
          size="small"
          sx={{
            bgcolor: hostel.type === 'boy' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(219, 39, 119, 0.1)',
            color: hostel.type === 'boy' ? '#2563eb' : '#db2777',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
        <Chip
          label={`${totalBlocks} Block${totalBlocks !== 1 ? 's' : ''}`}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            height: 24,
          }}
        />
        {roomTypeSummary.map((item) => (
          <Chip
            key={item.key}
            label={`${item.label}: ${item.value}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              height: 24,
            }}
          />
        ))}
      </Box>

      <Stack spacing={1} sx={{ mb: 2.5 }}>
        <Box>
          <Typography fontSize="0.8rem" color="text.secondary" fontWeight={500} sx={{ mb: 0.25 }}>
            Warden
          </Typography>
          <Typography fontWeight={700} color="text.primary">
            {wardenName}
          </Typography>
          {wardenEmail && (
            <Typography fontSize="0.8rem" color="text.secondary">
              {wardenEmail}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, 1fr)' },
          gap: 1.5,
          pt: 2,
        }}
      >
        <Box>
          <Typography fontSize="0.8rem" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
            Blocks
          </Typography>
          <Typography fontWeight={700} color="text.primary" sx={{ fontSize: '1.2rem' }}>
            {totalBlocks}
          </Typography>
        </Box>
        <Box>
          <Typography fontSize="0.8rem" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
            Available Rooms
          </Typography>
          <Typography fontWeight={700} color="text.primary" sx={{ fontSize: '1.2rem' }}>
            {availableRooms}
          </Typography>
        </Box>
        <Box>
          <Typography fontSize="0.8rem" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
            Total Rooms
          </Typography>
          <Typography fontWeight={700} color="text.primary" sx={{ fontSize: '1.2rem' }}>
            {totalRooms}
          </Typography>
        </Box>
      </Box>

    
    </DashboardCard>
  )
}

export default HostelCard
