import { useEffect, useState } from 'react'
import { Box, Button, Typography, Grid, CircularProgress, Alert } from '@mui/material'
import { Add, DomainAdd } from '@mui/icons-material'
import HostelCard from './HostelCard.jsx'
import HostelFormDialog from './HostelFormDialog.jsx'
import {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
} from '../../../services/hostelService'

function HostelsView() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHostel, setEditingHostel] = useState(null)

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setError('')
        const data = await getHostels()
        setHostels(data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load hostels.')
      } finally {
        setLoading(false)
      }
    }

    fetchHostels()
  }, [])

  const handleOpenNew = () => {
    setEditingHostel(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (hostel) => {
    setEditingHostel(hostel)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingHostel(null)
  }

  const handleSaveHostel = async (formData) => {
    const payload = {
      name: formData.name,
      type: formData.type,
      blocks: Array.isArray(formData.blocks)
        ? formData.blocks.map((block) => ({
            _id: block._id,
            name: block.name,
            totalRooms: Number(block.totalRooms || 0),
            rooms: Array.isArray(block.rooms) ? block.rooms : [],
          }))
        : [],
    }

    try {
      setSaving(true)
      setError('')

      if (editingHostel?._id) {
        const updatedHostel = await updateHostel(editingHostel._id, payload)
        setHostels((prev) =>
          prev.map((hostel) => (hostel._id === editingHostel._id ? updatedHostel : hostel))
        )
      } else {
        const newHostel = await createHostel(payload)
        setHostels((prev) => [newHostel, ...prev])
      }

      handleCloseDialog()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save hostel.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHostel = async (hostelId) => {
    const confirmed = window.confirm('Are you sure you want to delete this hostel?')
    if (!confirmed) return

    try {
      setError('')
      await deleteHostel(hostelId)
      setHostels((prev) => prev.filter((hostel) => hostel._id !== hostelId))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete hostel.')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          Manage Hostels
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenNew}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3, py: 1 }}
        >
          Create Hostel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && hostels.length === 0 ? (
        <Box
          textAlign="center"
          py={12}
          bgcolor={(theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(37, 99, 235, 0.02)')}
          borderRadius={3}
          border={(theme) => `1px dashed ${theme.palette.divider}`}
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(37, 99, 235, 0.04)'),
            },
          }}
        >
          <DomainAdd sx={{ fontSize: 72, color: 'text.secondary', mb: 2, opacity: 0.4 }} />
          <Typography variant="h5" color="text.secondary" fontWeight={700} mb={1}>
            No Hostels Found
          </Typography>
          <Typography color="text.secondary" variant="body2" mb={4} sx={{ maxWidth: 400, mx: 'auto' }}>
            Start by creating a new hostel to manage rooms and students.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenNew} sx={{ borderRadius: 2, px: 3, py: 1 }}>
            Create First Hostel
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {hostels.map((hostel) => (
            <Grid item xs={12} sm={6} md={6} lg={5} key={hostel._id}>
              <HostelCard
                hostel={hostel}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteHostel}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Reusable dialog for Create/Edit */}
      <HostelFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSaveHostel}
        initialData={editingHostel}
        loading={saving}
      />
    </Box>
  )
}

export default HostelsView
