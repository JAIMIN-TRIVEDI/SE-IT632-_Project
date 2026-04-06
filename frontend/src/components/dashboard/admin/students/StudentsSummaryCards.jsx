import { Box, Grid, Typography } from '@mui/material'
import { People, Apartment, CheckCircle, PauseCircle } from '@mui/icons-material'
import DashboardCard from '../../DashboardCard.jsx'

const summaryItems = [
  {
    key: 'totalStudents',
    label: 'Students',
    helper: 'Current filtered result',
    icon: People,
    iconColor: 'primary.main',
    iconBg: 'primary.light',
  },
  {
    key: 'totalHostels',
    label: 'Hostels',
    helper: 'Represented in list',
    icon: Apartment,
    iconColor: 'info.main',
    iconBg: 'info.light',
  },
  {
    key: 'activeStudents',
    label: 'Active',
    helper: 'Eligible and currently active',
    icon: CheckCircle,
    iconColor: 'success.main',
    iconBg: 'success.light',
  },
  {
    key: 'inactiveStudents',
    label: 'Inactive',
    helper: 'Temporarily disabled/inactive',
    icon: PauseCircle,
    iconColor: 'warning.main',
    iconBg: 'warning.light',
  },
]

function StudentsSummaryCards({ summary }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {summaryItems.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.key}>
          <DashboardCard>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="text.primary">
                  {summary[item.key] ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.helper}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <item.icon fontSize="small" />
              </Box>
            </Box>
          </DashboardCard>
        </Grid>
      ))}
    </Grid>
  )
}

export default StudentsSummaryCards
