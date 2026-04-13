import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import { getMessMenu, updateMessMenu } from '../services/messService'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snacks', label: 'Snacks' },
  { key: 'dinner', label: 'Dinner' },
]

function MessMenuManagement() {
  const [menu, setMenu] = useState(null)
  const [weekStart, setWeekStart] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchMenu = async () => {
    try {
      setError('')
      setLoading(true)
      const data = await getMessMenu()
      if (data) {
        setMenu(data.menu || {})
        setWeekStart(data.weekStart || '')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load menu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const handleFieldChange = (day, type, value) => {
    setMenu((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }))
  }

  const menuRows = useMemo(() => {
    return DAYS.map((day) => ({
      day,
      values: menu?.[day] || {},
    }))
  }, [menu])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await updateMessMenu({ weekStart, menu })
      setSuccess('Menu updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save menu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Menu Management
          </Typography>
          <Typography color="text.secondary">
            Update the weekly mess menu for students.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ textTransform: 'none' }}
        >
          {saving ? 'Saving…' : 'Save Menu'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter menu items separated by commas. Example: "Idli, Sambar, Chutney".
          </Typography>

          <Grid container spacing={2}>
            {menuRows.map(({ day, values }) => (
              <Grid item xs={12} md={6} key={day}>
                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight={700} mb={2} textTransform="capitalize">
                    {day}
                  </Typography>
                  {MEAL_TYPES.map((meal) => (
                    <TextField
                      key={`${day}-${meal.key}`}
                      label={meal.label}
                      value={values[meal.key] ?? ''}
                      onChange={(event) => handleFieldChange(day, meal.key, event.target.value)}
                      fullWidth
                      multiline
                      minRows={1}
                      sx={{ mb: 2 }}
                    />
                  ))}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  )
}

export default MessMenuManagement
