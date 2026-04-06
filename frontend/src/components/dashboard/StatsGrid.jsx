import { Box } from '@mui/material'
import {
  People,
  Apartment,
  MeetingRoom,
  Payments
} from '@mui/icons-material'
import StatCard from './StatCard.jsx'

function StatsGrid({ data, loading }) {
  if (loading || !data) return null

  const stats = [
    {
      label: "Total Students",
      value: data.totalStudents,
      icon: People,
      iconColor: '#2563eb',
      iconBg: 'rgba(37, 99, 235, 0.1)',
      badge: '5.2%',
      badgeTrend: 'up',
    },
    {
      label: "Total Rooms",
      value: data.totalRooms,
      icon: MeetingRoom,
      iconColor: '#9333ea',
      iconBg: 'rgba(147, 51, 234, 0.1)',
    },
    {
      label: "Complaints",
      value: data.complaints,
      icon: Apartment,
      iconColor: '#ea580c',
      iconBg: 'rgba(234, 88, 12, 0.1)',
      progress: 70,
    },
    {
      label: "Payments",
      value: data.payments,
      icon: Payments,
      iconColor: '#16a34a',
      iconBg: 'rgba(22, 163, 74, 0.1)',
      badge: '12%',
      badgeTrend: 'up',
    },
  ]

  return (
    <Box display="flex" gap={2} mb={3}>
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </Box>
  )
}

export default StatsGrid