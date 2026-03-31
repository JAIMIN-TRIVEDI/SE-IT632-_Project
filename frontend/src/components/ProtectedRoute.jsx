import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'))

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // ❌ Wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      student: '/student/dashboard',
      warden: '/warden/dashboard',
      hostel_admin: '/hostel-admin/dashboard',
      mess_admin: '/mess-admin/dashboard'
    }

    return <Navigate to={roleRoutes[user.role]} replace />
  }

  return children
}

export default ProtectedRoute