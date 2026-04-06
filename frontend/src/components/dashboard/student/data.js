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
  CreditCard,
  Warning,
  ReportProblem,
  History,
} from '@mui/icons-material'

export const navItems = [
  { label: 'Dashboard', icon: DashboardIcon },
  { label: 'My Room', icon: KingBed },
  { label: 'Mess Subscription', icon: EventAvailable },
  { label: 'Mess Menu', icon: Restaurant },
  { label: 'Payments', icon: CreditCard },
  { label: 'Complaints', icon: ReportProblem },
  { label: 'Notifications', icon: Notifications },
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