import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DashboardCard from '../DashboardCard.jsx'
import api from '../../../api/api'

const rangeOptions = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatDateForInput = (date) => {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const getDateRangeFromPreset = (preset) => {
  const option = rangeOptions.find((item) => item.value === preset) || rangeOptions[1]
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(end.getDate() - (option.days - 1))
  start.setHours(0, 0, 0, 0)

  return {
    from: formatDateForInput(start),
    to: formatDateForInput(end),
  }
}

function KpiTile({ label, value, helper }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} mt={0.75}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      ) : null}
    </Paper>
  )
}

function ReportsView() {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [preset, setPreset] = useState('30d')
  const initial = useMemo(() => getDateRangeFromPreset('30d'), [])
  const [fromDate, setFromDate] = useState(initial.from)
  const [toDate, setToDate] = useState(initial.to)
  const [analytics, setAnalytics] = useState(null)

  const fetchAnalytics = async (from, to) => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/reports/analytics/hostel-admin', {
        params: {
          from,
          to,
        },
      })

      setAnalytics(response.data.data)
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load reports analytics.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(fromDate, toDate)
  }, [])

  const applyPreset = (nextPreset) => {
    setPreset(nextPreset)
    const range = getDateRangeFromPreset(nextPreset)
    setFromDate(range.from)
    setToDate(range.to)
    fetchAnalytics(range.from, range.to)
  }

  const applyCustomRange = () => {
    setPreset('custom')
    fetchAnalytics(fromDate, toDate)
  }

  const funnelChartData = useMemo(() => {
    if (!analytics?.roomRequestFunnel) return []
    const funnel = analytics.roomRequestFunnel

    return [
      { name: 'Total Requests', value: funnel.total || 0, fill: '#0ea5e9' },
      { name: 'Approved', value: funnel.approved || 0, fill: '#22c55e' },
      { name: 'Rejected', value: funnel.rejected || 0, fill: '#ef4444' },
      { name: 'Pending', value: funnel.pending || 0, fill: '#f59e0b' },
    ]
  }, [analytics])

  const blockColors = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6']
  const requestStageColors = ['#0ea5e9', '#22c55e', '#ef4444', '#f59e0b']
  const gridColor = theme.palette.mode === 'dark' ? alpha('#cbd5e1', 0.16) : '#e2e8f0'

  if (loading && !analytics) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Loading report analytics...</Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.25,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Reports Analysis
          </Typography>
          <Typography color="text.secondary">
            Occupancy, room request funnel, and payment collections at a glance.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel id="range-filter-label">Range</InputLabel>
            <Select
              labelId="range-filter-label"
              value={preset}
              label="Range"
              onChange={(event) => applyPreset(event.target.value)}
            >
              {rangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="From"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { xs: '100%', sm: 170 } }}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: { xs: '100%', sm: 170 } }}
          />

          <Chip
            label="Apply"
            color="primary"
            variant="filled"
            onClick={applyCustomRange}
            sx={{ borderRadius: 1.75, px: 0.75, fontWeight: 700 }}
          />
        </Stack>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiTile
            label="Total Beds"
            value={analytics?.kpis?.totalBeds ?? 0}
            helper="Configured capacity"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiTile
            label="Occupied Beds"
            value={analytics?.kpis?.occupiedBeds ?? 0}
            helper="Current active allocations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiTile
            label="Occupancy"
            value={`${analytics?.kpis?.occupancyPct ?? 0}%`}
            helper="Live occupancy ratio"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiTile
            label="Pending Requests"
            value={analytics?.kpis?.pendingRequests ?? 0}
            helper="Awaiting admin action"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiTile
            label="Total Dues"
            value={formatCurrency(analytics?.kpis?.totalDues ?? 0)}
            helper="Pending payments in selected range"
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
          gap: 2.5,
          alignItems: 'stretch',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <DashboardCard sx={{ height: '100%', width: '100%' }}>
            <Typography fontWeight={800}>Occupancy Trend</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Occupied beds and occupancy percentage trend.
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.occupancyTrend || []}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupiedBeds"
                    name="Occupied Beds"
                    stroke="#0ea5e9"
                    fill={alpha('#0ea5e9', 0.25)}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancyPct"
                    name="Occupancy %"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </DashboardCard>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <DashboardCard sx={{ height: '100%' }}>
            <Typography fontWeight={800}>Block-wise Occupancy</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Occupancy percentage by block.
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.blockWiseOccupancy || []} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="blockName" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={60} />
                  <YAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="occupancyPct" radius={[0, 8, 8, 0]}>
                    {(analytics?.blockWiseOccupancy || []).map((entry, index) => (
                      <Cell key={`${entry.blockName}-${index}`} fill={blockColors[index % blockColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </DashboardCard>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <DashboardCard sx={{ height: '100%' }}>
            <Typography fontWeight={800}>Room Request Stages</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Stage-wise request counts in the selected period.
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${value} requests`} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {funnelChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={requestStageColors[index % requestStageColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Stack direction="row" spacing={1.25} flexWrap="wrap">
              <Chip size="small" label={`Approval ${analytics?.roomRequestFunnel?.approvalRate ?? 0}%`} />
              <Chip size="small" label={`Rejection ${analytics?.roomRequestFunnel?.rejectionRate ?? 0}%`} />
              <Chip size="small" label={`Pending ${analytics?.roomRequestFunnel?.pendingRate ?? 0}%`} />
            </Stack>
          </DashboardCard>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <DashboardCard sx={{ height: '100%' }}>
            <Typography fontWeight={800}>Payments and Dues Trend</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Collected amount vs dues with collection efficiency.
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.paymentsAndDuesTrend || []}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="money" tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="pct" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'Collection Efficiency') return `${value}%`
                      return formatCurrency(value)
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="money" dataKey="collected" name="Collected" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="money" dataKey="dues" name="Dues" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Line
                    yAxisId="pct"
                    type="monotone"
                    dataKey="collectionEfficiency"
                    name="Collection Efficiency"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </DashboardCard>
        </Box>
      </Box>
    </Stack>
  )
}

export default ReportsView
