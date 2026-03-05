import { Avatar, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { pendingFees } from './data.js'
import DashboardCard from './DashboardCard.jsx'

function PendingFeesCard() {
  const theme = useTheme()
  return (
    <DashboardCard>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Pending Fees
        </Typography>
        <Button
          sx={{
            color: 'primary.main',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            p: 0,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          Export CSV
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: 13,
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1,
              }}
            >
              Student Name
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingFees.map((student) => (
            <TableRow key={student.name} sx={{ '&:last-child td': { border: 0 } }}>
              <TableCell sx={{ py: 1.5, border: 'none' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? alpha(student.color, 0.35)
                          : student.color,
                      color: theme.palette.getContrastText(student.color),
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {student.initials}
                  </Avatar>
                  <Typography fontSize={14} fontWeight={500} color="text.primary">
                    {student.name}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  )
}

export default PendingFeesCard
