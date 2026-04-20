import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, Typography } from '@mui/material'
import RoomCard from '../components/dashboard/student/myroom/RoomCard'
import RoomDetails from '../components/dashboard/student/myroom/RoomDetails'
import RoommatesSection from '../components/dashboard/student/myroom/RoommatesSection'
import RoomPoliciesCard from '../components/dashboard/student/myroom/RoomPoliciesCard'
import VacateRequestCard from '../components/dashboard/student/myroom/VacateRequestCard'
import api from '../api/api'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    )
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

function MyRoom({ dashboardData, searchQuery = '', onVacateRequested }) {
  const navigate = useNavigate()
  const room = dashboardData?.room
  const renewal = dashboardData?.renewal
  const request = dashboardData?.roomRequest
  const vacateRequest = dashboardData?.vacateRequest
  const roommates = dashboardData?.roommates || []
  const [renewalPaying, setRenewalPaying] = useState(false)
  const [renewalError, setRenewalError] = useState('')

  const filteredRoommates = useMemo(() => {
    if (!searchQuery.trim()) {
      return roommates
    }

    const q = searchQuery.toLowerCase()
    return roommates.filter((mate) => [mate.name, mate.initials].some((field) => String(field || '').toLowerCase().includes(q)))
  }, [roommates, searchQuery])

  const roomAssigned = Boolean(room)
  const canPayRenewal = Boolean(
    room &&
      room.allocationId &&
      renewal &&
      renewal.status === 'due' &&
      renewal.windowOpen &&
      Number(renewal.amount || 0) > 0,
  )

  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString()
  }

  const requestStatus = useMemo(() => {
    if (!request) return null
    return `${request.status.charAt(0).toUpperCase() + request.status.slice(1)} / ${request.paymentStatus.charAt(0).toUpperCase() + request.paymentStatus.slice(1)}`
  }, [request])

  const markPaymentFailed = async (orderId, reason) => {
    if (!orderId) return
    try {
      await api.post('/payments/fail', {
        orderId,
        reason,
      })
    } catch (_) {
      // Best effort update; failure should not block user flow.
    }
  }

  const handleRenewalPayment = async () => {
    if (!canPayRenewal) return

    setRenewalError('')
    setRenewalPaying(true)

    try {
      const orderRes = await api.post('/payments/order', {
        amount: renewal.amount,
        purpose: `Hostel semester renewal for Room ${room.roomNumber}`,
        subscriptionId: room.allocationId,
        type: 'hostel',
      })

      const order = orderRes.data?.order
      const keyRes = await api.get('/payments/key')
      const loaded = await loadRazorpayScript()

      if (!loaded) {
        await markPaymentFailed(order?.id, 'Unable to load Razorpay checkout script')
        throw new Error('Unable to load Razorpay checkout script.')
      }

      const options = {
        key: keyRes.data?.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Hostezy',
        description: `Next semester rent for Room ${room.roomNumber}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (onVacateRequested) {
              await onVacateRequested()
            }
          } catch (err) {
            setRenewalError(err.response?.data?.message || err.message)
          } finally {
            setRenewalPaying(false)
          }
        },
        modal: {
          ondismiss: () => {
            markPaymentFailed(order.id, 'Checkout dismissed by user')
            setRenewalPaying(false)
          },
        },
        theme: {
          color: '#1d4ed8',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', async (response) => {
        await markPaymentFailed(
          response?.error?.metadata?.order_id || order.id,
          response?.error?.description || 'Payment failed',
        )
        setRenewalPaying(false)
      })
      razorpay.open()
    } catch (err) {
      setRenewalError(err.response?.data?.message || err.message)
      setRenewalPaying(false)
    }
  }

  if (!roomAssigned) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            No room assigned yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You do not have an assigned room yet. Please request a room and complete payment to get assigned.
          </Typography>
          {request ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Current request status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {requestStatus}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Requested type: {request.roomType ? request.roomType.toUpperCase() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Requested amount: ₹{request.amount?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          ) : null}

          {vacateRequest ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Vacate request status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {vacateRequest.status}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Reason: {vacateRequest.reason || 'N/A'}
              </Typography>
              {vacateRequest.processedBy?.name ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Reviewed by: {vacateRequest.processedBy.name}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Button variant="contained" onClick={() => navigate('/student/apply-room')}>
            Request a Room
          </Button>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {renewal && (
        <Card sx={{ p: 3, border: '1px solid', borderColor: canPayRenewal ? 'warning.light' : 'divider' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Semester Renewal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Hostel due date: <strong>{formatDate(renewal.dueDate)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Next semester payment window: <strong>{formatDate(renewal.paymentWindowStart)}</strong> to <strong>{formatDate(renewal.paymentWindowEnd)}</strong>
          </Typography>

          {canPayRenewal ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your 1-week renewal window is active. Pay now to keep the same room for next semester.
            </Alert>
          ) : renewal.status === 'due' ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Renewal is due. Razorpay payment will be enabled automatically during the semester start payment window.
            </Alert>
          ) : null}

          {renewalError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {renewalError}
            </Alert>
          ) : null}

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              disabled={!canPayRenewal || renewalPaying}
              onClick={handleRenewalPayment}
            >
              {renewalPaying ? 'Opening payment...' : `Pay Next Semester Rent (₹${Number(renewal.amount || 0).toFixed(2)})`}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/student/dashboard/payments')}>
              View Payment History
            </Button>
          </Box>
        </Card>
      )}

      <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <RoomCard room={room} />
      </Card>
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <RoomDetails room={room} searchQuery={searchQuery} />
          <RoommatesSection roommates={filteredRoommates} searchQuery={searchQuery} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <RoomPoliciesCard />
          <VacateRequestCard
            vacateRequest={vacateRequest}
            onRequestSubmitted={onVacateRequested}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default MyRoom
