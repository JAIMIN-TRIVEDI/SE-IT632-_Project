import { Avatar, Box, Divider, Typography } from '@mui/material'
import HighlightMatch from '../../../HighlightMatch.jsx'

const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'NA'
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

function RoomStudentsPanel({ students = [], occupiedCount = 0, searchQuery = '' }) {
  return (
    <Box
      sx={{
        mt: 1.5,
        pt: 1.5,
        borderTop: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Typography fontSize={12} color="text.secondary" fontWeight={700} mb={1.2}>
        Occupant Details
      </Typography>

      {students.length === 0 ? (
        <Typography fontSize={12.5} color="text.secondary">
          {occupiedCount > 0
            ? 'This room has active occupancy, but student details are not available at the moment.'
            : 'No students are currently allocated to this room.'}
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={1.25}>
          {students.map((student, index) => (
            <Box key={student.studentId || student.email || `${student.name}-${index}`}>
              <Box display="flex" alignItems="center" gap={1.2}>
                <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700 }}>
                  {getInitials(student.name)}
                </Avatar>
                <Box minWidth={0}>
                  <Typography fontSize={13} color="text.primary" fontWeight={600} noWrap>
                    <HighlightMatch text={student.name || 'Unknown Student'} query={searchQuery} />
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" noWrap>
                    <HighlightMatch text={student.email || 'No email available'} query={searchQuery} />
                  </Typography>
                </Box>
              </Box>
              <Typography fontSize={12} color="text.secondary" mt={0.8} pl={5.8}>
                Enrollment: <HighlightMatch text={student.enrollmentNo || 'N/A'} query={searchQuery} />
              </Typography>
              {index < students.length - 1 && <Divider sx={{ mt: 1.2 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default RoomStudentsPanel
