import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  Snackbar,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Alert,
  TextField,
} from '@mui/material'
import { getStudents } from '../services/messService'
import { useSearch } from '../hooks/useSearch'

function MessStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' })
  const { search, setSearch, isDebouncing, buildSearchParams } = useSearch('', 400)

  const fetchStudents = async () => {
    try {
      setError('')
      setLoading(true)
      const data = await getStudents(buildSearchParams())
      setStudents(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load student list.')
      setSnack({ open: true, message: 'Unable to load student list.', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [buildSearchParams])

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Mess Students
          </Typography>
          <Typography color="text.secondary">
            See all students subscribed to the mess service.
          </Typography>
        </Box>
        <Card sx={{ p: 2, minWidth: { xs: '100%', sm: 240 }, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography fontSize={12} color="text.secondary" gutterBottom>
              Total students
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {students.length}
            </Typography>
          </CardContent>
        </Card>
        <Button variant="outlined" onClick={fetchStudents} disabled={loading} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search students by name, email, or enrollment"
          fullWidth
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchStudents}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading || isDebouncing ? (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Enrollment</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}><Skeleton variant="text" height={34} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Enrollment</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    {search.trim() ? 'No results found.' : 'No students found.'}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.enrollmentNo}</TableCell>
                    <TableCell>{student.phone || '—'}</TableCell>
                    <TableCell>{student.currentPlan}</TableCell>
                    <TableCell>{student.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MessStudents
