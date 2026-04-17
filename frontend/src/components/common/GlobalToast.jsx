import { useEffect, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { subscribeToast } from '../../utils/toastBus'

function GlobalToast() {
  const [toast, setToast] = useState({
    open: false,
    severity: 'error',
    message: '',
  })

  useEffect(() => {
    const unsubscribe = subscribeToast((payload) => {
      setToast({
        open: true,
        severity: payload?.severity || 'error',
        message: payload?.message || 'Something went wrong.',
      })
    })

    return unsubscribe
  }, [])

  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={3500}
      onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={toast.severity}
        variant="filled"
        sx={{ width: '100%' }}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  )
}

export default GlobalToast
