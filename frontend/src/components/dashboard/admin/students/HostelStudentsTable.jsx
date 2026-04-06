import {
  Avatar,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import DashboardCard from '../../DashboardCard.jsx'

const formatDate = (dateValue) => {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
}

const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST'

function HostelStudentsTable({ selectedHostelName, rows }) {
  return (
    <DashboardCard>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Students - {selectedHostelName}
        </Typography>
        <Chip label={`${rows.length} records`} color="primary" variant="outlined" />
      </Box>

      {rows.length === 0 ? (
        <Box
          sx={{
            py: 8,
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Try changing hostel filter or search text.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: '62vh' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Enrollment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Allocated</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((student, index) => (
                <TableRow
                  key={`${student.studentId}-${student.hostelId}`}
                  hover
                  sx={{
                    '& td': { borderBottom: (theme) => `1px solid ${theme.palette.divider}` },
                    bgcolor: (theme) =>
                      index % 2 === 0
                        ? 'transparent'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.01)'
                          : 'rgba(15, 23, 42, 0.01)',
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.main' }}>
                        {getInitials(student.name)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {student.name || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {student.email || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{student.phone || '-'}</TableCell>
                  <TableCell>{student.enrollmentNo || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={student.gender || '-'}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip size="small" label={student.roomNumber || '-'} />
                      {student.roomType && (
                        <Chip size="small" label={student.roomType} variant="outlined" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(student.allocatedAt)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={student.isActive ? 'Active' : 'Inactive'}
                      color={student.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardCard>
  )
}

export default HostelStudentsTable
