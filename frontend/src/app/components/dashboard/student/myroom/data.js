import { Wifi, AcUnit, Tv } from '@mui/icons-material'

export const roomInfo = {
  roomNumber: '302',
  floor: 3,
  status: 'Currently Occupied',
  hostel: 'Greenwood Hostel',
  roomType: '3-Bed Shared',
  moveInDate: 'Aug 15, 2023',
  location: {
    address: '123 Pine St, University District',
    nearby: 'Near Central Library',
  },
}

export const amenities = [
  { icon: 'Wifi', label: 'WiFi' },
  { icon: 'AcUnit', label: 'AC' },
  { icon: 'Tv', label: 'TV' },
]

export const amenityIcons = {
  Wifi: Wifi,
  AcUnit: AcUnit,
  Tv: Tv,
}

export const roommates = [
  {
    id: 1,
    name: 'Marcus Johnson',
    initials: 'MJ',
    since: 'Sep 2023',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'David Chen',
    initials: 'DC',
    since: 'Oct 2023',
    department: 'Arts',
  },
]

export const roomPolicies = [
  'Quiet hours: 10 PM - 7 AM',
  'No guests after midnight',
  'Maintain common area cleanliness',
]
