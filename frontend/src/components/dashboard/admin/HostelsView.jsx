import { useEffect, useState } from 'react'
import { Box, Button, Typography, Grid, CircularProgress, Alert, Card, Divider, IconButton, TextField } from '@mui/material'
import { Add, DomainAdd } from '@mui/icons-material'
import { DeleteOutline } from '@mui/icons-material'
import HostelCard from './HostelCard.jsx'
import HostelFormDialog from './HostelFormDialog.jsx'
import {
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getAcademicSettings,
  updateAcademicSettings,
} from '../../../services/hostelService'

const createEmptyCourse = () => ({
  name: '',
  totalSemesters: '',
  oddSemesterStartDate: '',
  oddSemesterEndDate: '',
  evenSemesterStartDate: '',
  evenSemesterEndDate: '',
})

const toDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function HostelsView() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHostel, setEditingHostel] = useState(null)
  const [academicSaving, setAcademicSaving] = useState(false)
  const [academicForm, setAcademicForm] = useState({
    renewalWindowDays: 7,
    courses: [createEmptyCourse()],
  })

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setError('')
        const [data, settings] = await Promise.all([
          getHostels(),
          getAcademicSettings().catch(() => null),
        ])
        setHostels(data)

        if (settings) {
          setAcademicForm({
            renewalWindowDays: Number(settings.renewalWindowDays || 7),
            courses: Array.isArray(settings.courses) && settings.courses.length > 0
              ? settings.courses.map((course) => ({
                name: course.name || '',
                totalSemesters: String(course.totalSemesters || ''),
                oddSemesterStartDate: toDateInput(course.oddSemesterStartDate),
                oddSemesterEndDate: toDateInput(course.oddSemesterEndDate),
                evenSemesterStartDate: toDateInput(course.evenSemesterStartDate),
                evenSemesterEndDate: toDateInput(course.evenSemesterEndDate),
              }))
              : [createEmptyCourse()],
          })
        }
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

  const handleCourseChange = (index, field, value) => {
    setAcademicForm((prev) => ({
      ...prev,
      courses: prev.courses.map((course, idx) => (idx === index ? { ...course, [field]: value } : course)),
    }))
  }

  const handleAddCourse = () => {
    setAcademicForm((prev) => ({
      ...prev,
      courses: [...prev.courses, createEmptyCourse()],
    }))
  }

  const handleRemoveCourse = (index) => {
    setAcademicForm((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, idx) => idx !== index).length > 0
        ? prev.courses.filter((_, idx) => idx !== index)
        : [createEmptyCourse()],
    }))
  }

  const handleSaveAcademicSettings = async () => {
    try {
      setError('')
      setAcademicSaving(true)

      const courses = (academicForm.courses || [])
        .map((course) => ({
          name: String(course.name || '').trim(),
          totalSemesters: Number(course.totalSemesters),
          oddSemesterStartDate: course.oddSemesterStartDate,
          oddSemesterEndDate: course.oddSemesterEndDate,
          evenSemesterStartDate: course.evenSemesterStartDate,
          evenSemesterEndDate: course.evenSemesterEndDate,
          isActive: true,
        }))
        .filter((course) => course.name)

      if (courses.length === 0) {
        setError('Please add at least one course with semester count.')
        return
      }

      const hasMissingDates = courses.some(
        (course) =>
          !course.oddSemesterStartDate ||
          !course.oddSemesterEndDate ||
          !course.evenSemesterStartDate ||
          !course.evenSemesterEndDate,
      )

      if (hasMissingDates) {
        setError('Each course must include odd/even semester start and end dates.')
        return
      }

      const updated = await updateAcademicSettings({
        renewalWindowDays: Number(academicForm.renewalWindowDays || 7),
        courses,
      })

      setAcademicForm({
        renewalWindowDays: Number(updated.renewalWindowDays || 7),
        courses: (updated.courses || []).map((course) => ({
          name: course.name || '',
          totalSemesters: String(course.totalSemesters || ''),
          oddSemesterStartDate: toDateInput(course.oddSemesterStartDate),
          oddSemesterEndDate: toDateInput(course.oddSemesterEndDate),
          evenSemesterStartDate: toDateInput(course.evenSemesterStartDate),
          evenSemesterEndDate: toDateInput(course.evenSemesterEndDate),
        })),
      })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save academic settings.')
    } finally {
      setAcademicSaving(false)
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
      <br />
        <Card sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
          Academic Rules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure allowed courses and odd/even semester date windows.
          Students above course semester limit will be blocked from room allocation.
        </Typography>

        <Box sx={{ mb: 2, maxWidth: 500 }}>
          <TextField
            fullWidth
            type="number"
            label="Renewal Window (Days Before Next Semester Start)"
            value={academicForm.renewalWindowDays}
            onChange={(event) => setAcademicForm((prev) => ({
              ...prev,
              renewalWindowDays: event.target.value,
            }))}
            inputProps={{ min: 1, max: 60 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Course List
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {academicForm.courses.map((course, index) => (
            <Box
              key={`course-${index}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 180px 1fr 1fr 1fr 1fr 48px' },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <TextField
                label="Course Name"
                value={course.name}
                onChange={(event) => handleCourseChange(index, 'name', event.target.value)}
              />
              <TextField
                type="number"
                label="Total Semesters"
                value={course.totalSemesters}
                onChange={(event) => handleCourseChange(index, 'totalSemesters', event.target.value)}
                inputProps={{ min: 1, max: 20 }}
              />
              <TextField
                fullWidth
                type="date"
                label="Odd Sem Start"
                value={course.oddSemesterStartDate}
                onChange={(event) => handleCourseChange(index, 'oddSemesterStartDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Odd Sem End"
                value={course.oddSemesterEndDate}
                onChange={(event) => handleCourseChange(index, 'oddSemesterEndDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Even Sem Start"
                value={course.evenSemesterStartDate}
                onChange={(event) => handleCourseChange(index, 'evenSemesterStartDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="Even Sem End"
                value={course.evenSemesterEndDate}
                onChange={(event) => handleCourseChange(index, 'evenSemesterEndDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <IconButton color="error" onClick={() => handleRemoveCourse(index)}>
                <DeleteOutline />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          <Button variant="outlined" onClick={handleAddCourse}>
            Add Course
          </Button>
          <Button variant="contained" onClick={handleSaveAcademicSettings} disabled={academicSaving}>
            {academicSaving ? 'Saving...' : 'Save Academic Settings'}
          </Button>
        </Box>
      </Card>

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
