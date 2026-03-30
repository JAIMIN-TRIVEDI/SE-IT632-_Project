import { Card, CardContent } from '@mui/material'
import { CARD_SX } from '../../constants/constants'

function DashboardCard({ children, sx, contentSx }) {
  return (
    <Card
      sx={(theme) => ({
        ...(typeof CARD_SX === 'function' ? CARD_SX(theme) : CARD_SX),
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
    >
      <CardContent sx={{ p: 3, ...contentSx }}>{children}</CardContent>
    </Card>
  )
}

export default DashboardCard
