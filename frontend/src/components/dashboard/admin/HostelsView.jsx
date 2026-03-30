import { useState } from 'react'
import { Box, Button, Typography, Grid, IconButton, Chip } from '@mui/material'
import { Add, HomeWork, Edit, DomainAdd } from '@mui/icons-material'
import DashboardCard from '../DashboardCard.jsx'
import HostelFormDialog from './HostelFormDialog.jsx'

function HostelsView() {
  const [hostels, setHostels] = useState([
    {
      id: 1,
      name: 'Sunset Boys Hostel',
      type: 'boy',
      blocks: [
        { id: 101, name: 'Block A', totalRooms: '50' },
        { id: 102, name: 'Block B', totalRooms: '40' },
      ],
    },
    {
      id: 2,
      name: 'Sunrise Girls Hostel',
      type: 'girl',
      blocks: [
        { id: 201, name: 'North Wing', totalRooms: '60' },
      ],
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHostel, setEditingHostel] = useState(null)

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

  const handleSaveHostel = (formData) => {
    if (editingHostel) {
      // Update existing
      const updatedHostels = hostels.map((h) =>
        h.id === editingHostel.id ? { ...h, ...formData } : h
      )
      setHostels(updatedHostels)
    } else {
      // Create new
      const newHostel = {
        ...formData,
        id: Date.now(),
      }
      setHostels((prev) => [...prev, newHostel])
    }
    handleCloseDialog()
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

      {hostels.length === 0 ? (
        <Box
          textAlign="center"
          py={10}
          bgcolor={(theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white')}
          borderRadius={3}
          border={(theme) => `1px dashed ${theme.palette.divider}`}
        >
          <DomainAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No Hostels Found
          </Typography>
          <Typography color="text.secondary" variant="body2" mb={3}>
            Start by creating a new hostel to manage rooms and students.
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={handleOpenNew}>
            Add Hostel
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {hostels.map((hostel) => {
            const totalBlocks = hostel.blocks.length
            const totalRooms = hostel.blocks.reduce(
              (acc, block) => acc + parseInt(block.totalRooms || 0, 10),
              0
            )

            return (
              <Grid item xs={12} sm={6} md={4} key={hostel.id} sx={{ display: 'flex' }}>
                <DashboardCard
                  contentSx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  sx={(theme) => ({
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 8px 24px rgba(0,0,0,0.6)' 
                        : '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  })}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: hostel.type === 'girl' ? '#fdf2f8' : '#eff6ff',
                        color: hostel.type === 'girl' ? '#db2777' : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HomeWork />
                    </Box>
                    <IconButton size="small" onClick={() => handleOpenEdit(hostel)} sx={{ color: 'text.secondary' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" fontWeight={700} noWrap title={hostel.name}>
                    {hostel.name}
                  </Typography>

                  <Box display="flex" gap={1} mt={1} mb={2}>
                    <Chip
                      label={hostel.type === 'boy' ? 'Boys' : 'Girls'}
                      size="small"
                      sx={{
                        bgcolor: hostel.type === 'boy' ? '#eff6ff' : '#fdf2f8',
                        color: hostel.type === 'boy' ? '#2563eb' : '#db2777',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                    <Chip
                      label={`${totalBlocks} Blocks`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      pt: 2,
                      mt: 'auto',
                      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box>
                      <Typography fontSize="0.75rem" color="text.secondary">
                        Total Capacity
                      </Typography>
                      <Typography fontWeight={700} color="text.primary">
                        {totalRooms} Rooms
                      </Typography>
                    </Box>
                  </Box>
                </DashboardCard>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Reusable dialog for Create/Edit */}
      <HostelFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSaveHostel}
        initialData={editingHostel}
      />
    </Box>
  )
}

export default HostelsView
