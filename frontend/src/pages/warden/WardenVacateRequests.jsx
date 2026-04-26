import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import api from '../../api/api'

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'all']

function WardenVacateRequests({ searchQuery }) {
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState('')
  const [rejectDialog, setRejectDialog] = useState({ open: false, request: null })
  const [rejectionReason, setRejectionReason] = useState('')

  const loadRequests = async (nextStatus = status) => {
    setLoading(true)
    try {
      const res = await api.get(`/vacate-requests/warden?status=${nextStatus}`)
      setRequests(res.data?.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vacate requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests(status)
  }, [status])

  const filteredRequests = useMemo(() => {
    if (!searchQuery?.trim()) return requests
    const q = searchQuery.toLowerCase()

    return requests.filter((request) => {
      const student = request.studentId || {}
      const room = request.roomId || {}
      const hostel = request.hostelId || {}

      return (
        student.name?.toLowerCase().includes(q) ||
        student.email?.toLowerCase().includes(q) ||
        student.enrollmentNo?.toLowerCase().includes(q) ||
        hostel.name?.toLowerCase().includes(q) ||
        String(room.roomNumber || '').toLowerCase().includes(q) ||
        request.status?.toLowerCase().includes(q) ||
        request.reason?.toLowerCase().includes(q)
      )
    })
  }, [requests, searchQuery])

  const reviewAction = async (requestId, action, reason = '') => {
    try {
      setActingId(requestId)
      await api.put(`/vacate-requests/${requestId}/${action}`, { reason })
      await loadRequests(status)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process request.')
    } finally {
      setActingId('')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Vacate Requests
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Review vacate reasons and approve or reject requests for your hostel.
          </Typography>
        </Box>

        <Select
          size="small"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 180 } }}
        >
          {STATUS_OPTIONS.map((item) => (
            <MenuItem key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {filteredRequests.length === 0 ? (
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">
            No vacate requests found for this filter.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredRequests.map((request) => {
            const student = request.studentId || {}
            const room = request.roomId || {}
            const hostel = request.hostelId || {}
            const isPending = request.status === 'pending'
            const isBusy = actingId === request._id

            return (
              <Grid item xs={12} md={6} key={request._id}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.2,
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography fontWeight={800}>
                      {student.name || 'Student'}
                    </Typography>
                    <Chip
                      label={request.status}
                      color={
                        request.status === 'approved'
                          ? 'success'
                          : request.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </Box>

                  <Stack spacing={0.5} sx={{ mb: 1.2 }}>
                    <Typography fontSize={13} color="text.secondary">
                      Email: {student.email || 'N/A'}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Enrollment: {student.enrollmentNo || 'N/A'}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Hostel: {hostel.name || 'N/A'}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Room: {room.roomNumber || 'N/A'}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.4} sx={{ mb: 1.5 }}>
                    <Typography fontSize={13} color="text.secondary">
                      Reason: {request.reason || 'N/A'}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Allocation status: {request.allocationId ? 'Linked' : 'Missing'}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Processed by: {request.processedBy?.name || 'Pending'}
                    </Typography>
                  </Stack>

                  {request.rejectionReason ? (
                    <Alert severity="info" sx={{ mb: 1.5 }}>
                      Rejection note: {request.rejectionReason}
                    </Alert>
                  ) : null}

                  <Stack direction="row" spacing={1.2}>
                    <Button
                      variant="contained"
                      disabled={!isPending || isBusy}
                      onClick={() => reviewAction(request._id, 'approve')}
                    >
                      {isBusy ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={!isPending || isBusy}
                      onClick={() => {
                        setRejectDialog({ open: true, request })
                        setRejectionReason('')
                      }}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, request: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Vacate Request</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.2 }} color="text.secondary">
            Add a short note explaining why the request was rejected.
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Example: Please visit the hostel office before vacating."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, request: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!rejectDialog.request) return
              await reviewAction(rejectDialog.request._id, 'reject', rejectionReason)
              setRejectDialog({ open: false, request: null })
            }}
            disabled={actingId === rejectDialog.request?._id}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WardenVacateRequests
