import { useState, useEffect } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import DashboardCard from './DashboardCard.jsx'
import api from '../../api/api'

function RevenueChartCard() {
  const theme = useTheme()

  const [data, setData] = useState([])

  // ✅ FETCH REAL PAYMENT DATA
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/reports/payments')

        const payments = res.data.payments || []

        // 🔥 GROUP BY MONTH
        const monthlyData = {}

        payments.forEach(p => {
          const date = new Date(p.createdAt)
          const month = date.toLocaleString('default', { month: 'short' })

          monthlyData[month] = (monthlyData[month] || 0) + p.amount
        })

        const formatted = Object.keys(monthlyData).map(month => ({
          month,
          revenue: monthlyData[month]
        }))

        setData(formatted)

      } catch (err) {
        console.error('Revenue fetch error:', err)
      }
    }

    fetchPayments()
  }, [])

  const gridColor =
    theme.palette.mode === 'dark'
      ? alpha('#e2e8f0', 0.12)
      : '#f1f5f9'

  const tickColor = theme.palette.text.secondary
  const tooltipBg = theme.palette.background.paper
  const tooltipBorder = theme.palette.divider

  return (
    <DashboardCard sx={{ flex: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
        <Box>
          <Typography fontWeight={700} fontSize={16}>
            Revenue Overview
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Monthly income trends
          </Typography>
        </Box>

        <Chip
          label="Live Data"
          size="small"
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.15)
                : '#f1f5f9',
            fontSize: 12,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Box>

      <Box sx={{ height: 260, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: tickColor }}
            />

            <YAxis hide />

            <Tooltip
              formatter={(value) => [`₹${value}`, 'Revenue']}
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${tooltipBorder}`,
                backgroundColor: tooltipBg,
              }}
            />

            <Bar
              dataKey="revenue"
              fill={theme.palette.primary.main}
              radius={[6, 6, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  )
}

export default RevenueChartCard