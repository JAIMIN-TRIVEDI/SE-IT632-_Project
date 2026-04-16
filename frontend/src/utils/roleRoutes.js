export const roleRoutes = {
  student: '/student/dashboard',
  warden: '/warden/dashboard',
  hostel_admin: '/hostel-admin/dashboard',
  mess_admin: '/mess-admin/dashboard',
}

export const getDefaultRouteForRole = (role) => roleRoutes[role] || '/login'
