import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  LinearProgress,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ExpandMore, ExpandLess, MeetingRoom } from '@mui/icons-material'
import HighlightMatch from '../../../HighlightMatch.jsx'
import RoomStatusChip from './RoomStatusChip.jsx'
import RoomStudentsPanel from './RoomStudentsPanel.jsx'

function RoomCardItem({ room, searchQuery = '' }) {
  const [expanded, setExpanded] = useState(false)

  const occupancyPct = useMemo(() => {
    if (!room.capacity) return 0
    return Math.min(100, Math.round((room.occupiedCount / room.capacity) * 100))
  }, [room.capacity, room.occupiedCount])

  const canExpand = room.effectiveStatus === 'occupied' || room.students.length > 0

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'primary.light',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 18px rgba(0,0,0,0.35)'
              : '0 8px 18px rgba(15,23,42,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.2}>
          <Box>
            <Box display="flex" alignItems="center" gap={0.8}>
              <MeetingRoom sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography fontSize={15} fontWeight={800} color="text.primary">
                Room <HighlightMatch text={room.roomNumber || 'N/A'} query={searchQuery} />
              </Typography>
            </Box>
            <Typography fontSize={12.5} color="text.secondary" mt={0.5}>
              Block: <HighlightMatch text={room.blockName || 'Unassigned'} query={searchQuery} />
            </Typography>
          </Box>
          <RoomStatusChip status={room.effectiveStatus} />
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1.1} mt={1.8}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.06)
                  : alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Typography fontSize={11} color="text.secondary">Type</Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary" sx={{ textTransform: 'capitalize' }}>
              <HighlightMatch text={room.roomType || 'N/A'} query={searchQuery} />
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.06)
                  : alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Typography fontSize={11} color="text.secondary">Price</Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary">
              INR {Number(room.price || 0).toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.06)
                  : alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Typography fontSize={11} color="text.secondary">Capacity</Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary">{room.capacity || 0}</Typography>
          </Box>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.06)
                  : alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Typography fontSize={11} color="text.secondary">Occupied</Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary">{room.occupiedCount || 0}</Typography>
          </Box>
        </Box>

        <Box mt={1.7}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography fontSize={11.5} color="text.secondary">Occupancy</Typography>
            <Typography fontSize={11.5} color="text.secondary">{occupancyPct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={occupancyPct}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: 'divider',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: room.effectiveStatus === 'occupied' ? 'error.main' : room.effectiveStatus === 'maintenance' ? 'warning.main' : 'success.main',
              },
            }}
          />
          <Typography fontSize={11.5} color="text.secondary" mt={0.7}>
            Available beds: {room.availableBeds}
          </Typography>
        </Box>

        {canExpand && (
          <Button
            onClick={() => setExpanded((prev) => !prev)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{
              mt: 1,
              px: 0,
              minWidth: 'fit-content',
              textTransform: 'none',
              fontSize: 12.5,
              fontWeight: 700,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            {expanded ? 'Hide student details' : `View student details (${room.students.length || room.occupiedCount || 0})`}
          </Button>
        )}

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <RoomStudentsPanel
            students={room.students}
            occupiedCount={room.occupiedCount}
            searchQuery={searchQuery}
          />
        </Collapse>
      </CardContent>
    </Card>
  )
}

export default RoomCardItem
