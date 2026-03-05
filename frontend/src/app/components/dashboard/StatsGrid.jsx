import { Box } from '@mui/material'
import { stats } from './data.js'
import StatCard from './StatCard.jsx'

function StatsGrid() {
  return (
    <Box display="flex" gap={2} mb={3}>
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </Box>
  )
}

export default StatsGrid
