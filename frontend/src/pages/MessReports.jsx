import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton,
} from '@mui/material'
import { TrendingUp, People, Payment, Assignment } from '@mui/icons-material'
import api from '../api/api'

function MessReports() {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const fetchReports = async () => {
    try {
      setError('')
      setLoading(true)
      const response = await api.get('/reports/mess')
      setReportData(response.data?.data || {})
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load reports.'
      setError(message)
      setToastOpen(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  if (loading) {
    return (
      <Box sx={{ minHeight: '100%' }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={44} />
          <Skeleton variant="text" width={360} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} item xs={12} sm={6} md={3}>
              <Skeleton variant="rounded" height={130} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={320} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchReports}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    )
  }

  const isEmpty = !reportData || Object.keys(reportData).length === 0

  if (isEmpty) {
    return (
      <Box sx={{ minHeight: '100%', py: 8, textAlign: 'center' }}>
        <Typography variant="h6" mb={1}>No report data found</Typography>
        <Typography color="text.secondary" mb={3}>There is no report data available right now.</Typography>
        <Button variant="outlined" onClick={fetchReports} sx={{ textTransform: 'none' }}>Reload Reports</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Mess Reports
          </Typography>
          <Typography color="text.secondary">
            Overview of mess operations and performance metrics.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={fetchReports} disabled={loading} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Active Subscriptions
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {reportData.activeSubscriptions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment color="secondary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Total Plans
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {reportData.totalPlans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Monthly Revenue
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                ₹{reportData.monthlyRevenue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Pending Refunds
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {reportData.pendingRefundRequests || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Recent Activity Summary
          </Typography>
          <Typography color="text.secondary" mb={3}>
            This section provides a summary of recent mess operations. For detailed reports, consider exporting data or using advanced analytics tools.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Active Subscriptions</TableCell>
                  <TableCell align="right">{reportData.activeSubscriptions || 0}</TableCell>
                  <TableCell>
                    <Typography color={reportData.activeSubscriptions > 0 ? 'success.main' : 'text.secondary'}>
                      {reportData.activeSubscriptions > 0 ? 'Active' : 'No active subscriptions'}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Available Plans</TableCell>
                  <TableCell align="right">{reportData.totalPlans || 0}</TableCell>
                  <TableCell>
                    <Typography color={reportData.totalPlans > 0 ? 'success.main' : 'text.secondary'}>
                      {reportData.totalPlans > 0 ? 'Plans available' : 'No plans created'}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Revenue (Last 30 days)</TableCell>
                  <TableCell align="right">₹{reportData.monthlyRevenue || 0}</TableCell>
                  <TableCell>
                    <Typography color={reportData.monthlyRevenue > 0 ? 'success.main' : 'text.secondary'}>
                      {reportData.monthlyRevenue > 0 ? 'Revenue generated' : 'No revenue this month'}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pending Refund Requests</TableCell>
                  <TableCell align="right">{reportData.pendingRefundRequests || 0}</TableCell>
                  <TableCell>
                    <Typography color={reportData.pendingRefundRequests === 0 ? 'success.main' : 'warning.main'}>
                      {reportData.pendingRefundRequests === 0 ? 'All clear' : 'Action required'}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }} onClose={() => setToastOpen(false)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MessReports