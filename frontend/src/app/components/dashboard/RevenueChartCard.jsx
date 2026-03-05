import { Box, Chip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { revenueData } from './data.js'
import DashboardCard from './DashboardCard.jsx'

function RevenueChartCard() {
  const theme = useTheme()
  const gridColor = theme.palette.mode === 'dark' ? alpha('#e2e8f0', 0.12) : '#f1f5f9'
  const tickColor = theme.palette.text.secondary
  const tooltipBg = theme.palette.background.paper
  const tooltipBorder = theme.palette.divider
  return (
    <DashboardCard sx={{ flex: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
        <Box>
          <Typography fontWeight={700} fontSize={16} color="text.primary">
            Revenue Overview
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Monthly income trends for the current year
          </Typography>
        </Box>
        <Chip
          label="Last 6 Months"
          size="small"
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.15)
                : '#f1f5f9',
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Box>
      <Box sx={{ height: 260, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={revenueData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg }}
            />
            <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  )
}

export default RevenueChartCard
