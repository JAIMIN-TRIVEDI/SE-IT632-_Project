import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
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

const getInputDateString = (date) => {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const buildEmptyMenu = () => {
  return DAYS.reduce((acc, day) => {
    acc[day] = {
      breakfast: '',
      lunch: '',
      snacks: '',
      dinner: '',
    }
    return acc
  }, {})
}

const mergeWithDefaultMenu = (menu = {}) => {
  const base = buildEmptyMenu()

  DAYS.forEach((day) => {
    MEAL_TYPES.forEach((meal) => {
      if (menu?.[day]?.[meal.key] !== undefined) {
        base[day][meal.key] = menu[day][meal.key]
      }
    })
  })

  return base
}

function MessMenuManagement() {
  const [menu, setMenu] = useState(buildEmptyMenu())
  const [weekStart, setWeekStart] = useState('')
  const [selectedDate, setSelectedDate] = useState(getInputDateString(new Date()))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const fetchMenu = async (date) => {
    try {
      setError('')
      setLoading(true)
      const data = await getMessMenu(date)

      setMenu(mergeWithDefaultMenu(data?.menu || {}))
      setWeekStart(data?.weekStart ? getInputDateString(data.weekStart) : '')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load menu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu(selectedDate)
  }, [selectedDate])

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
      await updateMessMenu({ date: selectedDate, menu })
      setToastMessage('Menu saved successfully.')
      setToastOpen(true)
      await fetchMenu(selectedDate)
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

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          type="date"
          label="View Menu By Date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 240 } }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Week Start"
          value={weekStart}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 180 } }}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
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

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default MessMenuManagement
