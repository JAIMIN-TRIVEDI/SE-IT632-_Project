import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Skeleton,
  Snackbar,
  Alert,
  Typography,
  Grid,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import AutorenewIcon from '@mui/icons-material/Autorenew'

const API = 'http://localhost:5000/api/v1'

//TO DO : Make razorpay integration work, add cancel subscription option, show current plan details, add more plans, improve UI, add admin features

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('userToken') ||
  JSON.parse(localStorage.getItem('userInfo') || 'null')?.token ||
  null

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
})

// ---------- FEATURES ----------
function defaultFeatures(plan) {
  return [
    { label: '3 Meals per day', included: true },
    { label: 'Snacks included', included: true },
    { label: 'Veg & Non-Veg', included: true },
    { label: 'Special Meals', included: plan.durationInDays > 7 },
  ]
}

// ---------- PLAN CARD ----------
function PlanCard({ plan, onSubscribe, loading, currentPlanId }) {
  const isActive = currentPlanId === plan._id
  const features = defaultFeatures(plan)

  return (
    <Paper
      sx={{
        border: '1px solid #ddd',
        borderRadius: 3,
        p: 3,
        height: 420, // FIXED HEIGHT
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography fontSize={18} fontWeight={700}>
          {plan.name}
        </Typography>

        {/* PRICE ↓ SMALLER */}
        <Typography fontSize={24} fontWeight={800} mt={1}>
          ₹{plan.price}
        </Typography>

        <Typography fontSize={12} color="text.secondary">
          / {plan.durationInDays} Days
        </Typography>

        <Divider sx={{ my: 2 }} />

        {features.map((f, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1 }}>
            {f.included ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
            <Typography fontSize={13}>{f.label}</Typography>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        disabled={loading || isActive}
        onClick={() => onSubscribe(plan._id)}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={18} /> : isActive ? 'Current Plan' : 'Subscribe'}
      </Button>
    </Paper>
  )
}

// ---------- MAIN ----------
export default function ApplyMessPlan() {
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [subscribingId, setSubscribingId] = useState(null)
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  useEffect(() => {
    axios.get(`${API}/mess/plans`, authHeaders())
      .then((r) => setPlans(r.data.data || []))
      .catch(() => notify('Failed to load plans', 'error'))
      .finally(() => setLoadingPlans(false))
  }, [])

  const handleSubscribe = async (planId) => {
    setSubscribingId(planId)
    try {
      await axios.post(`${API}/mess/subscribe`, { planId }, authHeaders())
      notify('Subscribed successfully')
      setSubscription({ planId })
    } catch {
      notify('Subscription failed', 'error')
    } finally {
      setSubscribingId(null)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>

      {/* HEADER */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        Mess Subscription
      </Typography>

      {/* PLANS */}
      {loadingPlans ? (
        <Skeleton height={200} />
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan._id}>
              <PlanCard
                plan={plan}
                onSubscribe={handleSubscribe}
                loading={subscribingId === plan._id}
                currentPlanId={subscription?.planId}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}