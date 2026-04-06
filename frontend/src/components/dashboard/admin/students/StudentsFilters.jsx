import { Box, Button, InputAdornment, MenuItem, TextField } from '@mui/material'
import { Search, FilterAltOff, Apartment } from '@mui/icons-material'
import DashboardCard from '../../DashboardCard.jsx'

function StudentsFilters({
  selectedHostel,
  hostelOptions,
  searchTerm,
  onHostelChange,
  onSearchChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <DashboardCard sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '260px 1fr auto' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          select
          label="Hostel"
          value={selectedHostel}
          onChange={(event) => onHostelChange(event.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Apartment fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="all">All hostels</MenuItem>
          {hostelOptions.map((hostel) => (
            <MenuItem key={hostel.hostelId} value={hostel.hostelId}>
              {hostel.hostelName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search students"
          placeholder="Name, email, phone, enrollment..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FilterAltOff />}
          onClick={onClear}
          disabled={!hasActiveFilters}
          sx={{
            height: 56,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Clear
        </Button>
      </Box>
    </DashboardCard>
  )
}

export default StudentsFilters
