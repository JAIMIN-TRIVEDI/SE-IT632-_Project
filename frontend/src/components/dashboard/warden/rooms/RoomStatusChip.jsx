import { Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    color: 'success.main',
  },
  occupied: {
    label: 'Occupied',
    color: 'error.main',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'warning.main',
  },
}

function RoomStatusChip({ status = 'available' }) {
  const normalized = String(status || '').toLowerCase()
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.available

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        minWidth: 108,
        justifyContent: 'center',
        fontWeight: 700,
        borderRadius: 1.5,
        color: config.color,
        bgcolor: (theme) => {
          const baseColor =
            config.color === 'error.main'
              ? theme.palette.error.main
              : config.color === 'warning.main'
              ? theme.palette.warning.main
              : theme.palette.success.main

          return alpha(baseColor, theme.palette.mode === 'dark' ? 0.24 : 0.12)
        },
        border: (theme) => {
          const baseColor =
            config.color === 'error.main'
              ? theme.palette.error.main
              : config.color === 'warning.main'
              ? theme.palette.warning.main
              : theme.palette.success.main

          return `1px solid ${alpha(baseColor, 0.45)}`
        },
      }}
    />
  )
}

export default RoomStatusChip
