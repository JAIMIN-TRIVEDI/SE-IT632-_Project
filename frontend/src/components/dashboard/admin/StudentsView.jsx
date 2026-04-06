import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import StudentsFilters from './students/StudentsFilters.jsx'
import StudentsSummaryCards from './students/StudentsSummaryCards.jsx'
import HostelStudentsTable from './students/HostelStudentsTable.jsx'
import { getStudentsByHostel } from '../../../services/studentService'

const getFlattenedStudents = (hostelWiseData) =>
  hostelWiseData.flatMap((hostel) =>
    (hostel.students || []).map((student) => ({
      ...student,
      hostelId: hostel.hostelId,
      hostelName: hostel.hostelName,
      hostelType: hostel.hostelType,
    }))
  )

function StudentsView() {
  const [hostelWiseData, setHostelWiseData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedHostel, setSelectedHostel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setError('')
        const response = await getStudentsByHostel()
        setHostelWiseData(Array.isArray(response) ? response : [])
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load students.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const flatStudents = useMemo(() => getFlattenedStudents(hostelWiseData), [hostelWiseData])

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return flatStudents.filter((student) => {
      const isHostelMatch = selectedHostel === 'all' || student.hostelId === selectedHostel
      if (!isHostelMatch) return false

      if (!normalizedSearch) return true

      const searchableFields = [
        student.name,
        student.email,
        student.phone,
        student.enrollmentNo,
        student.hostelName,
        student.roomNumber,
      ]

      return searchableFields.some((field) =>
        String(field || '').toLowerCase().includes(normalizedSearch)
      )
    })
  }, [flatStudents, selectedHostel, searchTerm])

  const summary = useMemo(() => {
    const totalStudents = filteredRows.length
    const hostelSet = new Set(filteredRows.map((item) => item.hostelId))
    const activeStudents = filteredRows.filter((item) => item.isActive).length

    return {
      totalStudents,
      totalHostels: hostelSet.size,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
    }
  }, [filteredRows])

  const selectedHostelName = useMemo(() => {
    if (selectedHostel === 'all') return 'All hostels'
    const selected = hostelWiseData.find((hostel) => hostel.hostelId === selectedHostel)
    return selected?.hostelName || 'Selected hostel'
  }, [selectedHostel, hostelWiseData])

  const hasActiveFilters = selectedHostel !== 'all' || searchTerm.trim().length > 0

  const handleClearFilters = () => {
    setSelectedHostel('all')
    setSearchTerm('')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.02)'
              : 'rgba(37, 99, 235, 0.04)',
        }}
      >
        <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
          Students by Hostel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          View and manage hostel-wise student allocations with quick filtering and search.
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`Selected: ${selectedHostelName}`} color="primary" variant="outlined" />
          <Chip label={`Visible students: ${filteredRows.length}`} variant="outlined" />
          <Chip label={`Total hostels: ${hostelWiseData.length}`} variant="outlined" />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <StudentsFilters
        selectedHostel={selectedHostel}
        hostelOptions={hostelWiseData}
        searchTerm={searchTerm}
        onHostelChange={setSelectedHostel}
        onSearchChange={setSearchTerm}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <StudentsSummaryCards summary={summary} />

      <HostelStudentsTable
        selectedHostelName={selectedHostelName}
        rows={filteredRows}
      />
    </Box>
  )
}

export default StudentsView
