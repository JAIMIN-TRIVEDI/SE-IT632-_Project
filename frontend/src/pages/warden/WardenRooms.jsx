import { useEffect, useMemo, useState } from 'react'
import { Box, Card, CircularProgress, Grid, InputBase, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Search } from '@mui/icons-material'
import api from '../../api/api'

function WardenRooms({ searchQuery }) {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/hostels')
        setHostels(res.data?.data || [])
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load hostels.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredHostels = useMemo(() => {
    if (!searchQuery?.trim()) return hostels
    const q = searchQuery.toLowerCase()

    return hostels.filter((hostel) => {
      const hostelMatch =
        hostel.name?.toLowerCase().includes(q) ||
        hostel.type?.toLowerCase().includes(q) ||
        hostel.wardenId?.name?.toLowerCase().includes(q)

      const blockMatch = hostel.blocks?.some((block) => block.name?.toLowerCase().includes(q))
      const roomMatch = hostel.rooms?.some((room) =>
        room.roomNumber?.toLowerCase().includes(q) ||
        room.roomType?.toLowerCase().includes(q) ||
        room.status?.toLowerCase().includes(q) ||
        String(room.capacity).includes(q) ||
        String(room.price).includes(q)
      )

      return hostelMatch || blockMatch || roomMatch
    })
  }, [hostels, searchQuery])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  if (hostels.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Assigned Hostel Rooms
          </Typography>
          <Typography color="text.secondary" fontSize={14} mt={0.5}>
            View every room detail for the hostel assigned to you.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.06)
                : '#f1f5f9',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 10,
            px: 2,
            py: 0.9,
            minWidth: 280,
            flex: 1,
            maxWidth: 420,
          }}
        >
          <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
          <InputBase
            placeholder="Search hostels, blocks, or rooms..."
            value={searchQuery}
            sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
            readOnly
          />
        </Box>
      </Box>

      {filteredHostels.map((hostel) => {
        const blockMap = new Map(hostel.blocks?.map((block) => [block._id, block.name]) || [])
        const totalRooms = hostel.stats?.totalRooms ?? hostel.rooms?.length ?? 0
        const availableRooms = hostel.stats?.availableRooms ?? 0
        const occupiedRooms = hostel.stats?.occupiedRooms ?? 0
        const maintenanceRooms = hostel.stats?.maintenanceRooms ?? 0

        return (
          <Card key={hostel._id} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
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
                <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1.25} sx={{ width: '100%', maxWidth: 420 }}>
                  {[
                    { label: 'Total Rooms', value: totalRooms },
                    { label: 'Available', value: availableRooms },
                    { label: 'Occupied', value: occupiedRooms },
                    { label: 'Maintenance', value: maintenanceRooms },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? alpha(theme.palette.common.white, 0.04)
                            : '#f8fafc',
                      }}
                    >
                      <Typography fontSize={12} color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography fontWeight={700} fontSize={18} color="text.primary">
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography fontSize={16} fontWeight={700} color="text.primary" mb={2}>
                  Room details
                </Typography>
                <Grid container spacing={2}>
                  {hostel.rooms?.length > 0 ? (
                    hostel.rooms.map((room) => {
                      const roomCapacity = room.capacity ?? 'N/A'
                      const roomPrice = room.price ?? 'N/A'
                      const roomStatus = room.status || 'unknown'
                      const blockName = blockMap.get(room.blockId) || 'Unassigned'
                      const occupiedCount = room.occupiedCount ?? room.occupied ?? 0

                      return (
                        <Grid item xs={12} md={6} lg={4} key={room._id}>
                          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 170 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box>
                                <Typography fontSize={15} fontWeight={700} color="text.primary">
                                  Room {room.roomNumber}
                                </Typography>
                                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                                  Block: {blockName}
                                </Typography>
                              </Box>
                              <Typography
                                sx={{
                                  textTransform: 'capitalize',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color:
                                    roomStatus === 'available'
                                      ? 'success.main'
                                      : roomStatus === 'full'
                                      ? 'error.main'
                                      : 'warning.main',
                                }}
                              >
                                {roomStatus}
                              </Typography>
                            </Box>
                            <Typography fontSize={13} color="text.secondary">
                              Type: {room.roomType ?? 'N/A'}
                            </Typography>
                            <Typography fontSize={13} color="text.secondary" mt={0.5}>
                              Capacity: {roomCapacity}
                            </Typography>
                            <Typography fontSize={13} color="text.secondary" mt={0.5}>
                              Occupied: {occupiedCount}
                            </Typography>
                            <Typography fontSize={13} color="text.secondary" mt={0.5}>
                              Price: ₹{roomPrice}
                            </Typography>
                          </Card>
                        </Grid>
                      )
                    })
                  ) : (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">No rooms are configured for this hostel yet.</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          </Card>
        )
      })}

      {filteredHostels.length === 0 && (
        <Typography color="text.secondary">No hostels match your search.</Typography>
      )}
    </Box>
  )
}

export default WardenRooms
