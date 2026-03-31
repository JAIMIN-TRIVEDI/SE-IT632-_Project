import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Card, CircularProgress, Grid, Typography, Alert } from '@mui/material'
import api from '../api/api'
import MessDayCard from '../components/dashboard/student/mess/MessDayCard.jsx'

function MessMenu() {
  const [loading, setLoading] = useState(true)
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/mess/menu')
        setMenu(response.data.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  const menuDays = useMemo(() => {
    if (!menu?.menu) return []
    return Object.entries(menu.menu).map(([day, meals]) => ({
      day,
      breakfast: meals.breakfast,
      lunch: meals.lunch,
      dinner: meals.dinner,
    }))
  }, [menu])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Weekly Mess Menu
            </Typography>
            <Typography color="text.secondary">
              {menu?.weekStart
                ? `Menu for the week starting ${new Date(menu.weekStart).toLocaleDateString()}`
                : 'Check the latest meals planned for this week.'}
            </Typography>
          </Box>
          <Button variant="contained" color="primary" size="small" onClick={() => window.location.reload()}>
            Refresh Menu
          </Button>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {menuDays.length ? (
          menuDays.map((day) => (
            <Grid key={day.day} item xs={12} md={6} lg={4}>
              <MessDayCard {...day} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body1" color="text.secondary">
                No mess menu is available right now. Please check back later.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default MessMenu
