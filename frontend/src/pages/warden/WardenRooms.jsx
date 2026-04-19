import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import api from '../../api/api'
import RoomCardItem from '../../components/dashboard/warden/rooms/RoomCardItem.jsx'

const getEffectiveStatus = ({ status, occupiedCount, capacity }) => {
  const normalizedStatus = String(status || '').toLowerCase()

  if (normalizedStatus === 'maintenance') return 'maintenance'

  if (occupiedCount > 0 || normalizedStatus === 'full' || (capacity > 0 && occupiedCount >= capacity)) {
    return 'occupied'
  }

  return 'available'
}

const sortRooms = (rooms, sortBy) => {
  const sorted = [...rooms]

  if (sortBy === 'occupancyDesc') {
    sorted.sort((a, b) => {
      if (b.occupiedCount !== a.occupiedCount) return b.occupiedCount - a.occupiedCount
      return String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''), undefined, { numeric: true })
    })
    return sorted
  }

  if (sortBy === 'capacityDesc') {
    sorted.sort((a, b) => {
      if (b.capacity !== a.capacity) return b.capacity - a.capacity
      return String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''), undefined, { numeric: true })
    })
    return sorted
  }

  if (sortBy === 'priceAsc') {
    sorted.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price
      return String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''), undefined, { numeric: true })
    })
    return sorted
  }

  sorted.sort((a, b) =>
    String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''), undefined, { numeric: true }),
  )
  return sorted
}

const includesQuery = (value, query) => String(value || '').toLowerCase().includes(query)

function WardenRooms({ searchQuery }) {
  const [hostels, setHostels] = useState([])
  const [studentsByHostel, setStudentsByHostel] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roomNumberFilter, setRoomNumberFilter] = useState('all')

  const fetchRoomsData = useCallback(async () => {
    setLoading(true)
    try {
      const [hostelsRes, studentsRes] = await Promise.all([
        api.get('/hostels'),
        api.get('/reports/students-by-hostel'),
      ])

      setHostels(hostelsRes.data?.data || [])
      setStudentsByHostel(studentsRes.data?.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load room data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoomsData()
  }, [fetchRoomsData])

  const mergedHostels = useMemo(() => {
    const studentsMap = new Map(
      (studentsByHostel || []).map((item) => [String(item.hostelId), item.students || []]),
    )

    return (hostels || []).map((hostel) => {
      const blockMap = new Map((hostel.blocks || []).map((block) => [String(block._id), block.name]))
      const roomStudentsMap = new Map()
      const hostelStudents = studentsMap.get(String(hostel._id)) || []

      for (const student of hostelStudents) {
        const roomKey = String(student.roomNumber || '').trim().toLowerCase()
        if (!roomKey) continue
        const students = roomStudentsMap.get(roomKey) || []
        students.push(student)
        roomStudentsMap.set(roomKey, students)
      }

      const rooms = (hostel.rooms || []).map((room) => {
        const roomStudents = roomStudentsMap.get(String(room.roomNumber || '').trim().toLowerCase()) || []
        const capacity = Number.isFinite(Number(room.capacity)) ? Number(room.capacity) : 0
        const occupiedFromRoom = Number.isFinite(Number(room.occupiedCount))
          ? Number(room.occupiedCount)
          : Number(room.occupied || 0)
        const occupiedCount = Math.max(0, occupiedFromRoom, roomStudents.length)
        const price = Number.isFinite(Number(room.price)) ? Number(room.price) : 0
        const effectiveStatus = getEffectiveStatus({
          status: room.status,
          occupiedCount,
          capacity,
        })

        return {
          ...room,
          blockName: blockMap.get(String(room.blockId)) || 'Unassigned',
          capacity,
          price,
          occupiedCount,
          students: roomStudents,
          availableBeds: Math.max(capacity - occupiedCount, 0),
          effectiveStatus,
        }
      })

      const occupiedRooms = rooms.filter((room) => room.effectiveStatus === 'occupied').length
      const availableRooms = rooms.filter((room) => room.effectiveStatus === 'available').length
      const maintenanceRooms = rooms.filter((room) => room.effectiveStatus === 'maintenance').length

      return {
        ...hostel,
        rooms,
        calculatedStats: {
          totalRooms: rooms.length,
          occupiedRooms,
          availableRooms,
          maintenanceRooms,
        },
      }
    })
  }, [hostels, studentsByHostel])

  const filteredHostels = useMemo(() => {
    const query = String(searchQuery || '').trim().toLowerCase()

    return mergedHostels
      .map((hostel) => {
        const filteredRooms = (hostel.rooms || []).filter((room) => {
          const matchesStatus = statusFilter === 'all' || room.effectiveStatus === statusFilter
          const matchesRoomNumber = roomNumberFilter === 'all' || String(room.roomNumber) === String(roomNumberFilter)

          const matchesQuery =
            !query ||
            [
              room.roomNumber,
              room.roomType,
              room.effectiveStatus,
              room.blockName,
              room.capacity,
              room.price,
              room.occupiedCount,
              hostel.name,
              hostel.type,
            ].some((field) => includesQuery(field, query)) ||
            room.students.some((student) =>
              [student.name, student.email, student.enrollmentNo].some((field) => includesQuery(field, query)),
            )

          return matchesStatus && matchesRoomNumber && matchesQuery
        })

        return {
          ...hostel,
          rooms: sortRooms(filteredRooms, 'roomNumberAsc'),
        }
      })
      .filter((hostel) => hostel.rooms.length > 0)
  }, [mergedHostels, searchQuery, roomNumberFilter, statusFilter])

  const roomNumberOptions = useMemo(() => {
    const values = new Set()
    for (const hostel of mergedHostels) {
      for (const room of hostel.rooms || []) {
        if (room.roomNumber) values.add(String(room.roomNumber))
      }
    }

    return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [mergedHostels])

  const filteredRoomStats = useMemo(() => {
    return filteredHostels.reduce(
      (acc, hostel) => {
        for (const room of hostel.rooms || []) {
          acc.total += 1
          if (room.effectiveStatus === 'occupied') acc.occupied += 1
          else if (room.effectiveStatus === 'maintenance') acc.maintenance += 1
          else acc.available += 1
        }
        return acc
      },
      { total: 0, occupied: 0, available: 0, maintenance: 0 },
    )
  }, [filteredHostels])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 720 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2.5 }}
          action={(
            <Button color="inherit" size="small" onClick={fetchRoomsData}>
              Retry
            </Button>
          )}
        >
          {error}
        </Alert>
      </Box>
    )
  }

  if (mergedHostels.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 740 }}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          No hostel assigned
        </Typography>
        <Typography color="text.secondary" mt={1}>
          You currently do not have a hostel assigned. Please contact the administrator.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Assigned Hostel Rooms
          </Typography>
          <Typography color="text.secondary" fontSize={14} mt={0.5}>
            View every room detail for the hostel assigned to you.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
        {[
          {
            label: 'Total Rooms',
            value: filteredRoomStats.total,
            color: 'primary.main',
          },
          {
            label: 'Occupied Rooms',
            value: filteredRoomStats.occupied,
            color: 'error.main',
          },
          {
            label: 'Available Rooms',
            value: filteredRoomStats.available,
            color: 'success.main',
          },
          {
            label: 'Maintenance Rooms',
            value: filteredRoomStats.maintenance,
            color: 'warning.main',
          },
        ].map((item) => (
          <Card
            key={item.label}
            sx={{
              p: 1.8,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.04)
                  : alpha(
                      item.color === 'error.main'
                        ? theme.palette.error.main
                        : item.color === 'success.main'
                        ? theme.palette.success.main
                        : item.color === 'warning.main'
                        ? theme.palette.warning.main
                        : theme.palette.primary.main,
                      0.08,
                    ),
            }}
          >
            <Typography fontSize={12} color="text.secondary">{item.label}</Typography>
            <Typography fontSize={22} fontWeight={800} color={item.color}>{item.value}</Typography>
          </Card>
        ))}
      </Box>

      {filteredHostels.length === 0 && (
        <Card sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
          <Typography color="text.secondary" fontSize={14}>
            No rooms match the current search and filter combination.
          </Typography>
        </Card>
      )}

      {filteredHostels.map((hostel) => {
        return (
          <Card
            key={hostel._id}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.02)
                  : alpha(theme.palette.primary.main, 0.025),
            }}
          >
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                <Box>
                  <Typography fontSize={20} fontWeight={800} color="text.primary">
                    {hostel.name}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary" mt={0.5}>
                    {hostel.type ? `${hostel.type} hostel` : 'Hostel details'}
                  </Typography>
                  {hostel.wardenId?.name && (
                    <Typography fontSize={13} color="text.secondary" mt={0.5}>
                      Warden: {hostel.wardenId.name}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={1.2} flexWrap="wrap" sx={{ width: { xs: '100%', md: 'auto' } }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      sx={{
                        borderRadius: 2.2,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.common.white, 0.06)
                            : '#f1f5f9',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                      }}
                    >
                      <MenuItem value="all">All statuses</MenuItem>
                      <MenuItem value="occupied">Occupied</MenuItem>
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 190 }}>
                    <Select
                      value={roomNumberFilter}
                      onChange={(event) => setRoomNumberFilter(event.target.value)}
                      sx={{
                        borderRadius: 2.2,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.common.white, 0.06)
                            : '#f1f5f9',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                      }}
                    >
                      <MenuItem value="all">All room numbers</MenuItem>
                      {roomNumberOptions.map((roomNo) => (
                        <MenuItem key={roomNo} value={roomNo}>
                          Room {roomNo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box>
                <Typography fontSize={16} fontWeight={700} color="text.primary" mb={2}>
                  Room details ({hostel.rooms.length})
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 2,
                  }}
                >
                  {hostel.rooms?.length > 0 ? (
                    hostel.rooms.map((room) => (
                      <Box key={room._id}>
                        <RoomCardItem room={room} searchQuery={searchQuery} />
                      </Box>
                    ))
                  ) : (
                    <Box>
                      <Typography color="text.secondary">No rooms are configured for this hostel yet.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        )
      })}
    </Box>
  )
}

export default WardenRooms
