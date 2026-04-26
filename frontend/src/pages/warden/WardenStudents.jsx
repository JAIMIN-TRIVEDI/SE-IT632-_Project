import { useEffect, useMemo, useState } from 'react'
import { Box, Card, CircularProgress, InputBase, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Search } from '@mui/icons-material'
import api from '../../api/api'

function WardenStudents({ searchQuery }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/reports/students-by-hostel/warden')
        setData(res.data?.data || [])
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const flattened = useMemo(() => {
    return data.flatMap((hostel) =>
      (hostel.students || []).map((student) => ({
        ...student,
        hostelName: hostel.hostelName,
      }))
    )
  }, [data])

  const filteredStudents = useMemo(() => {
    if (!searchQuery?.trim()) return flattened
    const q = searchQuery.toLowerCase()
    return flattened.filter((student) =>
      [student.name, student.email, student.enrollmentNo, student.hostelName, student.roomNumber]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    )
  }, [flattened, searchQuery])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}><Typography color="error">{error}</Typography></Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Student Directory
          </Typography>
          <Typography color="text.secondary" fontSize={14} mt={0.5}>
            Browse student allocations across hostels and rooms.
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
            minWidth: { xs: '100%', sm: 280 },
            width: { xs: '100%', sm: 'auto' },
            flex: 1,
            maxWidth: 420,
          }}
        >
          <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
          <InputBase
            placeholder="Search students..."
            value={searchQuery}
            sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
            readOnly
          />
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {['Student', 'Email', 'Hostel', 'Room', 'Enrollment', 'Status'].map((label) => (
                  <TableCell key={label} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, borderBottom: '1px solid', borderColor: 'divider' }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.studentId || student.enrollmentNo || student.email} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ py: 2, border: 'none' }}>
                    <Typography fontSize={14} fontWeight={600} color="text.primary">
                      {student.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{student.email}</TableCell>
                  <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{student.hostelName}</TableCell>
                  <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{student.roomNumber || 'N/A'}</TableCell>
                  <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{student.enrollmentNo || 'N/A'}</TableCell>
                  <TableCell sx={{ py: 2, border: 'none', color: student.isActive ? 'success.main' : 'text.secondary' }}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {filteredStudents.length === 0 && (
        <Typography color="text.secondary">
          {flattened.length === 0
            ? 'No students are currently assigned to your hostel. Check back later.'
            : 'No students match the current search.'}
        </Typography>
      )}
    </Box>
  )
}

export default WardenStudents
