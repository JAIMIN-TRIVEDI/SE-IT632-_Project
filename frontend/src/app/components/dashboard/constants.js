export const DRAWER_WIDTH = 210
export const PRIMARY_BLUE = '#2563eb'
export const CARD_SX = (theme) => ({
  borderRadius: 3,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 1px 4px rgba(0,0,0,0.4)'
      : '0 1px 4px rgba(0,0,0,0.08)',
  border: `1px solid ${theme.palette.divider}`,
  bgcolor: theme.palette.background.paper,
})
