import {
  Dashboard as DashboardIcon,
  KingBed,
  ReceiptLong,
  Restaurant,
  EventAvailable,
  Notifications,
  Person,
  LocalLaundryService,
  FitnessCenter,
  LocalLibrary,
  RestaurantMenu,
  CreditCard,
  Warning,
} from '@mui/icons-material'

export const navItems = [
  { label: 'Dashboard', icon: DashboardIcon },
  { label: 'My Room', icon: KingBed },
  { label: 'Payments', icon: ReceiptLong, badge: 1 },
  { label: 'Mess Menu', icon: Restaurant },
  { label: 'Mess Plan', icon: EventAvailable },
  { label: 'Profile', icon: Person },
]

export const quickStats = [
  {
    label: 'Next Fee Due',
    value: 'Mar 05',
    sub: 'Rs 8,500 pending',
    icon: ReceiptLong,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    light: '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label: 'Room Status',
    value: 'A-204',
    sub: '2 sharing · North Wing',
    icon: KingBed,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    light: '#fce7f3',
    iconColor: '#db2777',
  },
  {
    label: 'Mess Plan',
    value: 'Gold',
    sub: 'Veg · Active',
    icon: Restaurant,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    light: '#ecfeff',
    iconColor: '#0891b2',
  },
]

export const todaySchedule = [
  { time: '07:30 AM', title: 'Breakfast', location: 'Mess Hall', done: true },
  { time: '09:00 AM', title: 'Room Inspection', location: 'Floor 2', done: true },
  { time: '01:15 PM', title: 'Lunch', location: 'Mess Hall', done: false },
  { time: '06:30 PM', title: 'Gym Slot', location: 'Fitness Room', done: false },
]

export const services = [
  { title: 'Laundry', desc: 'Pickup at 8 PM tonight', icon: LocalLaundryService, color: '#16a34a', bg: '#dcfce7' },
  { title: 'Gym', desc: 'Open till 10 PM', icon: FitnessCenter, color: '#0ea5e9', bg: '#e0f2fe' },
  { title: 'Library', desc: 'Quiet hours from 9 PM', icon: LocalLibrary, color: '#7c3aed', bg: '#ede9fe' },
]

export const notices = [
  {
    title: 'Water Maintenance',
    desc: 'No water supply from 2 PM to 4 PM today.',
    time: '10 mins ago',
    tag: 'Urgent',
    tagColor: '#dc2626',
    tagBg: '#fee2e2',
  },
  {
    title: 'Hostel Night 🎉',
    desc: 'RSVP by Friday for the annual hostel night celebration.',
    time: '2 hours ago',
    tag: 'Event',
    tagColor: '#7c3aed',
    tagBg: '#ede9fe',
  },
  {
    title: 'Security Drill',
    desc: 'Fire drill at 4 PM in Block A. Attendance mandatory.',
    time: 'Yesterday',
    tag: 'Safety',
    tagColor: '#d97706',
    tagBg: '#fef3c7',
  },
]

export const roommates = [
  { name: 'Arjun Sharma', initials: 'AS', status: 'In hostel', color: '#4f46e5', bg: '#e0e7ff' },
  { name: 'Priya Singh', initials: 'PS', status: 'On leave', color: '#db2777', bg: '#fce7f3' },
  { name: 'Rahul Verma', initials: 'RV', status: 'In hostel', color: '#059669', bg: '#d1fae5' },
]

export const attendanceData = [
  { day: 'Mon', val: 100 },
  { day: 'Tue', val: 100 },
  { day: 'Wed', val: 0 },
  { day: 'Thu', val: 100 },
  { day: 'Fri', val: 100 },
  { day: 'Sat', val: 50 },
  { day: 'Sun', val: 0 },
]

export const statusCards = [
  {
    label: 'Room Number',
    value: '302',
    sub: 'Wing B',
    tag: 'LOCATION',
    icon: 'KingBed',
    tagColor: '#2563eb',
    tagBg: '#eff6ff',
  },
  {
    label: 'Mess Status',
    value: 'Regular',
    sub: 'Monthly Plan',
    tag: 'ACTIVE',
    icon: 'Restaurant',
    tagColor: '#16a34a',
    tagBg: '#f0fdf4',
  },
  {
    label: 'Payment Status',
    value: 'Up-to-date',
    sub: 'Next due: Dec 15',
    tag: 'PAID',
    icon: 'CreditCard',
    tagColor: '#059669',
    tagBg: '#d1fae5',
  },
  {
    label: 'Open Complaints',
    value: '0',
    sub: 'No pending items',
    tag: 'RESOLVED',
    icon: 'CheckCircle',
    tagColor: '#9333ea',
    tagBg: '#faf5ff',
  },
]

export const recentNotifications = [
  {
    id: 1,
    title: 'Mess Menu Updated',
    desc: 'Check the new weekly menu for next week',
    time: '2 hours ago',
    icon: 'Restaurant',
    color: '#ea580c',
  },
  {
    id: 2,
    title: 'Laundry Service Available',
    desc: 'Your clothes are ready for pickup',
    time: '5 hours ago',
    icon: 'Checkroom',
    color: '#2563eb',
  },
  {
    id: 3,
    title: 'Fee Payment Reminder',
    desc: 'Reminder: Next fee payment due on Dec 15',
    time: '1 day ago',
    icon: 'Warning',
    color: '#dc2626',
  },
]

export const quickActions = [
  {
    id: 1,
    title: 'Raise Complaint',
    desc: 'Report an issue or concern',
    icon: 'RoomService',
    highlight: true,
  },
  {
    id: 2,
    title: 'View Menu',
    desc: 'Check weekly mess menu',
    icon: 'Restaurant',
    highlight: false,
  },
  {
    id: 3,
    title: 'Fee Breakdown',
    desc: 'View payment details',
    icon: 'CreditCard',
    highlight: false,
  },
]
