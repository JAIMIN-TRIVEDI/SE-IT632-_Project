import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Box, Card, Chip, CircularProgress, Divider, Typography,
} from '@mui/material'
import {
  NotificationsActive, Restaurant as RestaurantIcon, CheckCircle, Warning,
} from '@mui/icons-material'
import api from '../api/api'
import { MEAL_TYPES, getAllowedMealKeys } from '../constants/messMenu'

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS_IN_WEEK = 7
const MIN_CELL_WIDTH = 150
const TOTAL_COLUMNS = 8

const GUIDELINES = [
  { text: 'Carry your Hostel ID card for meal verification.', type: 'ok' },
  { text: 'Please do not waste food; take only what you can consume.', type: 'ok' },
  { text: 'Use the feedback register near the exit for daily suggestions.', type: 'ok' },
  { text: 'Mess timings are strictly followed. Late entry is not permitted.', type: 'warn' },
]

function getWeekStartMonday(dateInput = new Date()) {
  const d = new Date(dateInput)
  const day = d.getDay()
  const diff = (day + 6) % 7 // Monday=0 ... Sunday=6
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)
  return d
}

function getApiWeekStart(weekStart) {
  if (!weekStart) return getWeekStartMonday(new Date())
  const parsed = new Date(weekStart)
  if (Number.isNaN(parsed.getTime())) return getWeekStartMonday(new Date())
  parsed.setHours(0, 0, 0, 0)
  return parsed
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// ── Single table cell ──────────────────────────────────────────────────────────
function MealCell({ content, isToday }) {
  return (
    <Box sx={{
      px: 2,
      py: 2,
      minHeight: 64,
      boxSizing: 'border-box',
      width: '100%',
      bgcolor: isToday ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
      borderLeft: '1px solid', borderColor: 'divider',
    }}>
      {content ? (
        content.split(',').map((item, i) => (
          <Typography key={i} fontSize={13} color={isToday ? 'text.primary' : 'text.primary'} align="center" lineHeight={1.6}>
            {item.trim()}
          </Typography>
        ))
      ) : (
        <Typography fontSize={13} align='center' color="text.disabled">—</Typography>
      )}
    </Box>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MessMenu() {
  const [loading, setLoading] = useState(true)
  const [menu, setMenu] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState('none')
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setError(null)
      setLoading(true)
      const [menuRes, subRes] = await Promise.all([
        api.get('/mess/menu'),
        api.get('/mess/subscription/me').catch(() => ({ data: { data: null } })),
      ])
      console.log('[MessMenu] menu response', menuRes.data)
      console.log('[MessMenu] subscription response', subRes.data)
      setMenu(menuRes.data.data)
      setSubscription(subRes.data.data)
      setSubscriptionStatus(subRes.data.currentStatus || 'none')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const weekColumns = useMemo(() => {
    const start = getApiWeekStart(menu?.weekStart)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Array.from({ length: DAYS_IN_WEEK }, (_, idx) => {
      const date = new Date(start)
      date.setDate(start.getDate() + idx)

      const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      return {
        id: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        dayKey,
        short: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dateDisplay: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        isToday: isSameDate(date, today),
      }
    })
  }, [menu?.weekStart])

  // Build ordered days from API week sequence (no moving today's column)
  const orderedDays = useMemo(() => {
    return weekColumns.map((col) => ({
      ...col,
      meals: menu?.menu?.[col.dayKey] || {},
    }))
  }, [menu?.menu, weekColumns])

  const allowedMealKeys = Array.isArray(menu?.allowedMeals) && menu.allowedMeals.length > 0
    ? menu.allowedMeals
    : subscriptionStatus === 'active'
      ? getAllowedMealKeys(subscription?.planId || {})
      : []

  const visibleMealTypes = MEAL_TYPES.filter((meal) => allowedMealKeys.includes(meal.key))

  const hasActivePlan = subscriptionStatus === 'active' && visibleMealTypes.length > 0
  const hasHiddenMeals = hasActivePlan && visibleMealTypes.length < MEAL_TYPES.length
  const hasMenuItems = orderedDays.some(({ meals }) => {
    return visibleMealTypes.some((meal) => String(meals?.[meal.key] || '').trim().length > 0)
  })

  // Week range chip display
  const weekRange = useMemo(() => {
    const start = weekColumns[0]
    const end = weekColumns[weekColumns.length - 1]
    if (!start || !end) return null
    return `${start.dateDisplay} - ${end.dateDisplay}`
  }, [weekColumns])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={800} color="text.primary">Mess Menu</Typography>
          {weekRange && (
            <Chip label={`Current: ${weekRange}`} size="small"
              sx={{ fontWeight: 600, fontSize: 12, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: 'text.secondary' }} />
          )}
        </Box>
        {hasActivePlan && (
          <Chip
            label="● Mess Active"
            size="small"
            sx={{ fontWeight: 700, fontSize: 12, color: '#16a34a', bgcolor: '#dcfce7', border: '1px solid #bbf7d0' }}
          />
        )}
      </Box>

      {!hasActivePlan ? (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          No active plan
        </Alert>
      ) : !hasMenuItems ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No menu available for this week.
        </Alert>
      ) : hasHiddenMeals ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Meals not included in your plan are hidden.
        </Alert>
      ) : null}

      {/* ── Schedule card ───────────────────────────────────────────────── */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="text.primary">Weekly Schedule</Typography>
          <Typography fontSize={13} color="text.secondary" mt={0.3}>
            Serving fresh and healthy meals every day at the Main Hostel Mess.
          </Typography>
        </Box>

        {orderedDays.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No menu available for this week.</Typography>
          </Box>
        ) : (
          /* Scrollable table */
          <Box sx={{ overflowX: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ minWidth: TOTAL_COLUMNS * MIN_CELL_WIDTH, width: '100%' }}>

              {/* ── Column headers (days) ───────────────────────────────── */}
              <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, minmax(${MIN_CELL_WIDTH}px, 1fr))`, borderBottom: '1px solid', borderColor: 'divider' }}>
                {/* Meal type header cell */}
                <Box sx={{ boxSizing: 'border-box', px: 2, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography fontSize={13} fontWeight={700} color="primary.main">Meal Type</Typography>
                </Box>

                {orderedDays.map(({ id, isToday, short, dateDisplay }) => {
                  return (
                    <Box key={id} sx={{
                      boxSizing: 'border-box',
                      px: 2,
                      py: 2,
                      textAlign: 'center',
                      borderLeft: '1px solid', borderColor: 'divider',
                      bgcolor: isToday ? 'rgba(25,118,210,0.06)' : 'transparent',
                    }}>
                      <Typography fontSize={11} fontWeight={700} color={isToday ? 'primary.main' : 'text.secondary'} letterSpacing={0.5}>
                        {short}
                      </Typography>
                      {dateDisplay && (
                        <Typography fontSize={15} fontWeight={800} color={isToday ? 'primary.main' : 'text.primary'} lineHeight={1.2} mt={0.3}>
                          {dateDisplay}
                        </Typography>
                      )}
                      {isToday && (
                        <Chip label="TODAY" size="small"
                          sx={{ mt: 0.5, fontSize: 9, fontWeight: 800, height: 18, bgcolor: 'primary.main', color: '#fff',
                            '& .MuiChip-label': { px: 1 } }} />
                      )}
                    </Box>
                  )
                })}
              </Box>

              {/* ── Meal rows ───────────────────────────────────────────── */}
              {visibleMealTypes.map((meal, mealIdx) => {
                const Icon = meal.icon
                const isLast = mealIdx === visibleMealTypes.length - 1
                return (
                  <Box key={meal.key} sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${TOTAL_COLUMNS}, minmax(${MIN_CELL_WIDTH}px, 1fr))`,
                    borderBottom: isLast ? 'none' : '1px solid', borderColor: 'divider',
                  }}>
                    {/* Meal label */}
                    <Box sx={{ boxSizing: 'border-box', px: 2, py: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5, borderRight: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: meal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon sx={{ fontSize: 15, color: meal.color }} />
                        </Box>
                        <Typography fontSize={14} fontWeight={700} color={meal.color}>{meal.label}</Typography>
                      </Box>
                      <Typography fontSize={11} color="text.disabled" ml={4.5}>{meal.time}</Typography>
                    </Box>

                    {/* Day cells */}
                    {orderedDays.map(({ id, meals, isToday }) => {
                      return (
                        <MealCell key={id} content={meals[meal.key]} isToday={isToday} />
                      )
                    })}
                  </Box>
                )
              })}
              {!visibleMealTypes.length && (
                <Box sx={{ p: 4, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography color="text.secondary">No active plan</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Card>

      {/* ── Announcements + Guidelines ──────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Announcements */}
        <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <NotificationsActive sx={{ fontSize: 17, color: '#2563eb' }} />
            </Box>
            <Typography fontWeight={700} fontSize={16}>Important Announcements</Typography>
          </Box>

          {/* Static announcements — in real app these would come from notifications API */}
          {[
            { date: { month: 'OCT', day: '24' }, text: 'Special dessert will be served on Tuesday for Dussehra festival celebration.' },
            { date: { month: 'OCT', day: '27' }, text: 'Feedback meeting for mess menu changes will be held at 5:00 PM in Hall A.' },
          ].map((ann, i) => (
            <Box key={i} sx={{
              display: 'flex', gap: 2, alignItems: 'flex-start', mb: i < 1 ? 2 : 0,
              p: 2, borderRadius: 2,
              bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              border: '1px solid', borderColor: 'divider',
            }}>
              <Box sx={{
                minWidth: 42, height: 42, borderRadius: 2, bgcolor: 'primary.main',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Typography fontSize={9} fontWeight={700} color="#fff" letterSpacing={0.5}>{ann.date.month}</Typography>
                <Typography fontSize={15} fontWeight={800} color="#fff" lineHeight={1}>{ann.date.day}</Typography>
              </Box>
              <Typography fontSize={13} color="text.primary" lineHeight={1.6}>{ann.text}</Typography>
            </Box>
          ))}
        </Card>

        {/* Guidelines */}
        <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RestaurantIcon sx={{ fontSize: 17, color: '#16a34a' }} />
            </Box>
            <Typography fontWeight={700} fontSize={16}>Mess Guidelines</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {GUIDELINES.map((g, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                {g.type === 'warn'
                  ? <Warning sx={{ fontSize: 17, color: '#d97706', flexShrink: 0, mt: 0.1 }} />
                  : <CheckCircle sx={{ fontSize: 17, color: '#16a34a', flexShrink: 0, mt: 0.1 }} />}
                <Typography fontSize={13} color={g.type === 'warn' ? 'warning.dark' : 'text.primary'} lineHeight={1.6}>
                  {g.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  )
}