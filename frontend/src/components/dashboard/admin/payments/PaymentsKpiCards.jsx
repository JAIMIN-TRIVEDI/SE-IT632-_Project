import { Box, Typography } from '@mui/material'
import { TrendingUp, Schedule, PeopleAlt } from '@mui/icons-material'
import { formatCurrency } from './paymentHelpers'

const cardItems = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue Collected',
    icon: TrendingUp,
    iconColor: 'success.main',
    iconBg: 'success.light',
  },
  {
    key: 'pendingDues',
    label: 'Pending Dues',
    icon: Schedule,
    iconColor: 'warning.main',
    iconBg: 'warning.light',
  },
  {
    key: 'activeSubscriptions',
    label: 'Active Subscriptions',
    icon: PeopleAlt,
    iconColor: 'primary.main',
    iconBg: 'primary.light',
    isCount: true,
  },
]

function PaymentsKpiCards({ metrics }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
        mb: 2.5,
        alignItems: 'stretch',
      }}
    >
      {cardItems.map((item) => {
        const Icon = item.icon
        const rawValue = metrics[item.key] || 0
        const displayValue = item.isCount ? rawValue.toLocaleString('en-IN') : formatCurrency(rawValue)

        return (
          <Box key={item.key} sx={{ display: 'flex', minWidth: 0, height: '100%' }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                width: '100%',
                minHeight: 152,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 2,
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  borderColor: (theme) => theme.palette.primary.main,
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 8px 20px rgba(15,23,42,0.4)'
                      : '0 8px 20px rgba(15,23,42,0.08)',
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ lineHeight: 1.35, pr: 1 }}
                >
                  {item.label}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: item.iconBg,
                    color: item.iconColor,
                    flexShrink: 0,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
              </Box>

              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontSize: { xs: '1.55rem', md: '1.7rem' }, lineHeight: 1.1 }}
              >
                {displayValue}
              </Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default PaymentsKpiCards
