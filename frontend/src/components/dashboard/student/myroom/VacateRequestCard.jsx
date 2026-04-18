import React, { useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, TextField, Typography } from '@mui/material'
import api from '../../../../api/api'

export default function VacateRequestCard({ vacateRequest, onRequestSubmitted }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const statusMeta = useMemo(() => {
    if (!vacateRequest?.status) {
      return null
    }

    if (vacateRequest.status === 'approved') {
      return { label: 'Approved', color: 'success' }
    }

    if (vacateRequest.status === 'rejected') {
      return { label: 'Rejected', color: 'error' }
    }

    return { label: 'Pending Approval', color: 'warning' }
  }, [vacateRequest])

  const isPending = vacateRequest?.status === 'pending'
  const isApproved = vacateRequest?.status === 'approved'

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!reason.trim()) {
      setError('Please enter a reason for vacating.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/vacate-requests', { reason: reason.trim() })
      setSuccess('Vacate request submitted to your hostel warden for approval.')
      setReason('')
      if (onRequestSubmitted) {
        await onRequestSubmitted()
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'rgba(239, 68, 68, 0.05)',
        p: 2.5,
        textAlign: 'center',
        flexFlow:'column',
      }}
    >
      {/* Title */}
      <Typography variant="body2" fontWeight="bold" color="error.main">
        End your stay
      </Typography>
      <br />
      <Typography variant="caption" color="text.secondary">
        Submit a vacate request to your hostel warden
      </Typography>

      {statusMeta && (
        <Box sx={{ mt: 1.25 }}>
          <Chip
            size="small"
            color={statusMeta.color}
            label={statusMeta.label}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}

      <TextField
        multiline
        rows={3}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason for vacating (required)"
        disabled={isPending || isApproved || submitting}
        sx={{ mt: 2, textAlign: 'left', bgcolor: 'background.paper', borderRadius: 2 }}
      />

      {/* Button */}
      <Button
        variant="contained"
        color="error"
        onClick={handleSubmit}
        disabled={isPending || isApproved || submitting}
        sx={{
          mt: 2,
          borderRadius: 8,
          px: 3,
          py: 1,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
        }}
      >
        {submitting ? 'Submitting...' : 'Request Vacate'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 1.5, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 1.5, textAlign: 'left' }}>
          {success}
        </Alert>
      )}

      {/* Notice */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        {isApproved ? 'Approved request: your room has been released.' : 'Standard notice applies until the warden approves.'}
      </Typography>
    </Box>
  )
}
