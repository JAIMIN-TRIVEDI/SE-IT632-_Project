import { Box, IconButton, InputBase, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { LocationOn, Search, Tune } from '@mui/icons-material'
import LogoutButton from '../../LogoutButton.jsx'

function WardenTopBar({ activeNav, searchQuery, onSearchChange, placeholder }) {
  return (
    <Box
      sx={{
        px: 4,
        pt: 3,
        pb: 2,
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1.2}>
          {activeNav === 'Dashboard' ? 'Operational Overview' : activeNav}
        </Typography>
        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography fontSize={13} color="text.secondary">
            North Wing - Block A
          </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.08)
                : theme.palette.common.white,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 10,
            px: 2,
            py: 0.8,
            minWidth: 280,
          }}
        >
          <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
          <InputBase
            placeholder={placeholder || 'Search student or room...'}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}
          />
        </Box>
        <IconButton
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.08)
                : theme.palette.common.white,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            width: 40,
            height: 40,
          }}
        >
          <Tune sx={{ fontSize: 18, color: 'text.secondary' }} />
        </IconButton>
        <LogoutButton />
      </Box>
    </Box>
  )
}

export default WardenTopBar
