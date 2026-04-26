import { Box, Button, MenuItem, TextField } from '@mui/material'
import { Download, FilterAlt } from '@mui/icons-material'

function PaymentsFiltersBar({
  searchTerm,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onExport,
}) {
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
        <TextField
          size="small"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by tenant, transaction ID, hostel"
          sx={{ minWidth: { xs: '100%', md: 280 }, flex: 1 }}
        />

        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 150 } }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="success">Success</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </TextField>

        <TextField
          size="small"
          select
          label="Type"
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 160 } }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="hostel">Hostel</MenuItem>
          <MenuItem value="room_request">Room Request</MenuItem>
          <MenuItem value="mess">Mess</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, md: 'auto' }, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<FilterAlt />}>
          Advanced
        </Button>
        <Button variant="contained" startIcon={<Download />} onClick={onExport}>
          Export CSV
        </Button>
      </Box>
    </Box>
  )
}

export default PaymentsFiltersBar
