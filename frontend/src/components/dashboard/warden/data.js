import {
  Dashboard as DashboardIcon,
  MeetingRoom,
  FactCheck,
  Logout,
  Warning,
  People,
  Notifications,
  Person,
  KingBed,
  WaterDrop,
  Event,
  Security,
} from '@mui/icons-material'

export const navItems = [
  { label: 'Dashboard', icon: DashboardIcon },
  { label: 'Rooms', icon: MeetingRoom },
  { label: 'Room Requests', icon: FactCheck },
  { label: 'Vacate Requests', icon: Logout },
  { label: 'Complaints', icon: Warning },
  { label: 'Students', icon: People },
  { label: 'Notifications', icon: Notifications },
  { label: 'Profile', icon: Person },
]

export const stats = [
  {
    label: 'Rooms Occupied',
    value: '142/150',
    sub: '94.6% Rate',
    badge: '2%',
    badgeTrend: 'up',
    progressValue: 94.6,
    icon: KingBed,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
  },
  {
    label: 'New Complaints Today',
    value: '5',
    sub: '3 High Priority',
    badge: '10%',
    badgeTrend: 'up',
    icon: Warning,
    iconBg: '#fef2f2',
    iconColor: '#dc2626',
  },
  {
    label: 'Students On-leave',
    value: '24',
    sub: 'Expected return: tomorrow',
    badge: '5%',
    badgeTrend: 'down',
    icon: null,
    iconEmoji: '✈️',
    iconBg: '#fff7ed',
    iconColor: '#ea580c',
  },
]

export const recentActivity = [
  {
    name: 'Arjun Sharma',
    initials: 'AS',
    avatarColor: '#c7d2fe',
    textColor: '#4338ca',
    room: 'A-204',
    status: 'CHECK-IN',
    time: '09:12 AM',
  },
  {
    name: 'Priya Singh',
    initials: 'PS',
    avatarColor: '#fce7f3',
    textColor: '#be185d',
    room: 'B-108',
    status: 'CHECK-OUT',
    time: '08:45 AM',
  },
  {
    name: 'Rahul Verma',
    initials: 'RV',
    avatarColor: '#d1fae5',
    textColor: '#065f46',
    room: 'A-312',
    status: 'CHECK-IN',
    time: '08:22 AM',
  },
  {
    name: 'Meera Iyer',
    initials: 'MI',
    avatarColor: '#fef3c7',
    textColor: '#92400e',
    room: 'C-401',
    status: 'CHECK-OUT',
    time: '07:55 AM',
  },
]

export const announcements = [
  {
    icon: WaterDrop,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    title: 'Water Maintenance',
    desc: 'Water supply will be interrupted from 2 PM to 4 PM today.',
    time: '10 mins ago',
  },
  {
    icon: Event,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    title: 'Hostel Night RSVP',
    desc: 'Students are requested to register for the annual hostel night by Friday.',
    time: '2 hours ago',
  },
  {
    icon: Security,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    title: 'Security Drill',
    desc: 'Monthly fire safety and security drill scheduled for 4 PM.',
    time: 'Yesterday',
  },
]

export const availability = [
  { label: 'Single Rooms', current: 45, total: 50, color: '#2563eb' },
  { label: 'Double Rooms', current: 80, total: 90, color: '#2563eb' },
  { label: 'Deluxe Suites', current: 20, total: 20, color: '#16a34a' },
]
