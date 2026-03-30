import { useMemo, useState } from 'react'
import { Avatar, Box, Button, Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { MoreVert } from '@mui/icons-material'
import DashboardCard from '../DashboardCard.jsx'
import { recentActivity } from './data'

function WardenActivityTableCard() {
  const [activityFilter, setActivityFilter] = useState('All')

  const filteredActivity = useMemo(() => {
    if (activityFilter === 'All') return recentActivity
    if (activityFilter === 'In') return recentActivity.filter((item) => item.status === 'CHECK-IN')
    if (activityFilter === 'Out') return recentActivity.filter((item) => item.status === 'CHECK-OUT')
    return recentActivity
  }, [activityFilter])

  return (
    <DashboardCard sx={{ flex: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Recent Activity
        </Typography>
        <ToggleButtonGroup
          value={activityFilter}
          exclusive
          onChange={(event, value) => value && setActivityFilter(value)}
          size="small"
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.06) : '#f1f5f9',
            borderRadius: 2,
            border: 'none',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              fontSize: 13,
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.12)
                    : theme.palette.common.white,
                color: 'text.primary',
                fontWeight: 600,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 1px 2px rgba(0,0,0,0.5)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
              },
            },
          }}
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="In">In</ToggleButton>
          <ToggleButton value="Out">Out</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            {['STUDENT', 'ROOM', 'STATUS', 'TIME', 'ACTION'].map((header) => (
              <TableCell
                key={header}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1.5,
                  pt: 0,
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredActivity.map((row) => {
            const isCheckIn = row.status === 'CHECK-IN'
            return (
              <TableRow
                key={`${row.name}-${row.time}`}
                sx={{
                  '&:last-child td': { border: 0 },
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.06)
                        : '#f8fafc',
                  },
                }}
              >
                <TableCell sx={{ py: 1.8, border: 'none' }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? alpha(row.textColor, 0.25)
                            : row.avatarColor,
                        color: row.textColor,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {row.initials}
                    </Avatar>
                    <Typography fontSize={14} fontWeight={500} color="text.primary">
                      {row.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: 14, color: 'text.secondary', border: 'none', py: 1.8 }}>
                  {row.room}
                </TableCell>
                <TableCell sx={{ border: 'none', py: 1.8 }}>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 1,
                      height: 24,
                      bgcolor: (theme) =>
                        isCheckIn
                          ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.18)
                          : alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.16),
                      color: (theme) => (isCheckIn ? theme.palette.success.main : theme.palette.warning.main),
                      border: (theme) => `1px solid ${isCheckIn ? theme.palette.success.main : theme.palette.warning.main}`,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 14, color: 'text.secondary', border: 'none', py: 1.8 }}>
                  {row.time}
                </TableCell>
                <TableCell sx={{ border: 'none', py: 1.8 }}>
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <MoreVert fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Box textAlign="center" mt={2}>
        <Button
          sx={{
            color: 'primary.main',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          View All Activity History
        </Button>
      </Box>
    </DashboardCard>
  )
}

export default WardenActivityTableCard
