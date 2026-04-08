import { useEffect, useMemo, useState } from 'react'
import {
  Avatar, Box, Button, Card, Chip, CircularProgress,
  IconButton, InputBase, MenuItem, Select, Table,
  TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Search, MoreVert } from '@mui/icons-material'
import api from '../../api/api'

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

function WardenComplaints({ searchQuery }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/complaints')
        setComplaints(res.data?.data || [])
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesQuery = !searchQuery?.trim() || [
        complaint.description,
        complaint.category,
        complaint.status,
        complaint.studentId?.name,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'All' || complaint.status === statusFilter.toLowerCase()

      return matchesQuery && matchesStatus
    })
  }, [complaints, searchQuery, statusFilter])

  const handleUpdateStatus = async (id, status) => {
    setUpdating(id)
    try {
      const res = await api.put(`/complaints/${id}/status`, { status })
      setComplaints((prev) => prev.map((item) => item._id === id ? res.data.data : item))
    } catch {
      // ignore failure for now
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}><Typography color="error">{error}</Typography></Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            Manage Complaints
          </Typography>
          <Typography color="text.secondary" fontSize={14} mt={0.5}>
            Review and update the status of submitted complaints.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 440 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.06)
                  : '#f1f5f9',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 10,
              px: 2,
              py: 0.9,
              flex: 1,
            }}
          >
            <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
            <InputBase
              placeholder="Search complaints..."
              value={searchQuery}
              sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
              readOnly
            />
          </Box>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            size="small"
          >
            <MenuItem value="All">All statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Student', 'Room', 'Category', 'Status', 'Submitted', 'Action'].map((label) => (
                <TableCell key={label} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 12, borderBottom: '1px solid', borderColor: 'divider' }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComplaints.map((complaint) => (
              <TableRow key={complaint._id} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ py: 2, border: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>{complaint.studentId?.name?.slice(0, 2)}</Avatar>
                    <Typography fontSize={14} fontWeight={600} color="text.primary">
                      {complaint.studentId?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{complaint.roomId || complaint.room || 'N/A'}</TableCell>
                <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{complaint.category || 'General'}</TableCell>
                <TableCell sx={{ py: 2, border: 'none' }}>
                  <Chip
                    label={STATUS_LABELS[complaint.status] || complaint.status}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: 11, textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2, border: 'none', color: 'text.secondary' }}>{new Date(complaint.createdAt).toLocaleString()}</TableCell>
                <TableCell sx={{ py: 2, border: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      disabled={updating === complaint._id || complaint.status === 'in_progress'}
                      onClick={() => handleUpdateStatus(complaint._id, 'in_progress')}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      {complaint.status === 'in_progress' ? 'In Progress' : 'Start'}
                    </Button>
                    <Button
                      size="small"
                      disabled={updating === complaint._id || complaint.status === 'resolved'}
                      onClick={() => handleUpdateStatus(complaint._id, 'resolved')}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Resolve
                    </Button>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredComplaints.length === 0 && (
        <Typography color="text.secondary">
          {complaints.length === 0
            ? 'There are no complaints submitted yet.'
            : 'No complaints match the current filter.'}
        </Typography>
      )}
    </Box>
  )
}

export default WardenComplaints
