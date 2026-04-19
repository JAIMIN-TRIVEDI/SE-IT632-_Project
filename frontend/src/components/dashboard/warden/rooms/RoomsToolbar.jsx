import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material'

function RoomsToolbar({
  statusFilter,
  onStatusFilterChange,
  roomNumberFilter,
  onRoomNumberFilterChange,
  roomNumberOptions,
  roomCount,
  searchQuery,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Box>
        <Typography fontSize={13} color="text.secondary">
          Showing {roomCount} room{roomCount === 1 ? '' : 's'}
        </Typography>
        {searchQuery?.trim() && (
          <Typography fontSize={12} color="text.secondary" mt={0.3}>
            Search active for "{searchQuery.trim()}"
          </Typography>
        )}
      </Box>

      <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.2}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            sx={{ borderRadius: 2.2 }}
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
            onChange={(event) => onRoomNumberFilterChange(event.target.value)}
            sx={{ borderRadius: 2.2 }}
          >
            <MenuItem value="all">All room numbers</MenuItem>
            {(roomNumberOptions || []).map((roomNo) => (
              <MenuItem key={roomNo} value={roomNo}>
                Room {roomNo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}

export default RoomsToolbar
