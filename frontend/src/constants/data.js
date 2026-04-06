import {
  Dashboard as DashboardIcon,
  Apartment,
  KingBed,
  People,
  Restaurant,
  Payment,
  BarChart,
  Notifications,
  Settings,
  PersonAdd,
  CheckCircle,
  Warning,
} from '@mui/icons-material'

export const navItems = [
  { label: 'Dashboard', icon: DashboardIcon },
  { label: 'Hostels', icon: Apartment },
  { label: 'Rooms', icon: KingBed },
  { label: 'Students', icon: People },
  // { label: 'Mess Plans', icon: Restaurant },
  { label: 'Payments', icon: Payment },
  { label: 'Reports', icon: BarChart },
  { label: 'Notifications', icon: Notifications },
  // { label: 'Settings', icon: Settings },
]

export const stats = [
  {
    label: 'Total Students',
    value: '1,200',
    badge: '5.2%',
    badgeTrend: 'up',
    icon: People,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
  },
  {
    label: 'Rooms Occupied',
    value: '85%',
    progress: 85,
    extra: '850/1000',
    icon: KingBed,
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
  },
  {
    label: 'Total Revenue',
    value: '$45,280',
    badge: '12%',
    badgeTrend: 'up',
    icon: Payment,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
  },
  {
    label: 'Open Complaints',
    value: '12',
    badge: '3%',
    badgeTrend: 'down',
    icon: Warning,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
]

export const revenueData = [
  { month: 'Jan', revenue: 28000 },
  { month: 'Feb', revenue: 35000 },
  { month: 'Mar', revenue: 30000 },
  { month: 'Apr', revenue: 40000 },
  { month: 'May', revenue: 38000 },
  { month: 'Jun', revenue: 45280 },
]

export const recentActivities = [
  {
    name: 'John Doe',
    action: 'Registered for Room 302',
    time: '2 mins ago',
    icon: PersonAdd,
    color: '#64748b',
    bg: '#e2e8f0',
  },
  {
    name: 'Sarah Smith',
    action: 'Payment received ($500.00)',
    time: '15 mins ago',
    icon: CheckCircle,
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    name: 'Mike Wilson',
    action: 'Registered for Room 105',
    time: '1 hour ago',
    icon: PersonAdd,
    color: '#64748b',
    bg: '#e2e8f0',
  },
  {
    name: 'Emily Davis',
    action: 'New complaint: AC Maintenance',
    time: '3 hours ago',
    icon: Warning,
    color: '#ea580c',
    bg: '#ffedd5',
  },
]

export const pendingFees = [
  { initials: 'RJ', name: 'Robert Jenkins', color: '#2563eb' },
  { initials: 'LM', name: 'Linda Moore', color: '#7c3aed' },
  { initials: 'TC', name: 'Thomas Cook', color: '#0891b2' },
]
