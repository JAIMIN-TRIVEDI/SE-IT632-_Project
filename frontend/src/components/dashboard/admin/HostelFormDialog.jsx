import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material'
import { Close, Delete, Add } from '@mui/icons-material'

function HostelFormDialog({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    blocks: [],
  })

  // Set the form state when the dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          type: initialData.type || '',
          blocks: Array.isArray(initialData.blocks) ? initialData.blocks : [],
        })
      } else {
        setFormData({ name: '', type: '', blocks: [] })
      }
    }
  }, [open, initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddBlock = () => {
    setFormData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { id: Date.now(), name: '', totalRooms: '' }],
    }))
  }

  const handleBlockChange = (index, field, value) => {
    const updatedBlocks = [...formData.blocks]
    updatedBlocks[index][field] = value
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleRemoveBlock = (index) => {
    const updatedBlocks = formData.blocks.filter((_, i) => i !== index)
    setFormData({ ...formData, blocks: updatedBlocks })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Perform rough validation
    if (!formData.name || !formData.type) {
      alert('Please fill the hostel name and type.')
      return
    }
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {initialData ? 'Edit Hostel' : 'Create New Hostel'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Hostel Name"
            variant="outlined"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Sunrise Boys Hostel"
          />

          <FormControl fullWidth required>
            <InputLabel>Hostel Type</InputLabel>
            <Select
              label="Hostel Type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="boy">Boys</MenuItem>
              <MenuItem value="girl">Girls</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Blocks
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleAddBlock}
              sx={{ borderRadius: 2 }}
            >
              Add Block
            </Button>
          </Box>

          {formData.blocks.map((block, index) => (
            <Box
              key={block._id || block.id || index}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              }}
            >
              <TextField
                label="Block Name"
                variant="outlined"
                size="small"
                fullWidth
                required
                value={block.name}
                onChange={(e) => handleBlockChange(index, 'name', e.target.value)}
                placeholder="e.g. Block A"
              />
              <TextField
                label="Total Rooms"
                variant="outlined"
                size="small"
                type="number"
                fullWidth
                required
                value={block.totalRooms}
                onChange={(e) => handleBlockChange(index, 'totalRooms', e.target.value)}
                inputProps={{ min: 1 }}
              />
              <IconButton onClick={() => handleRemoveBlock(index)} color="error" size="small">
                <Delete />
              </IconButton>
            </Box>
          ))}
          {formData.blocks.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No blocks added. You can add them later.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            disableElevation
            sx={{ fontWeight: 600, borderRadius: 2, px: 3 }}
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Hostel'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default HostelFormDialog
