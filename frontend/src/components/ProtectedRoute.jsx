import { Box, CircularProgress } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getDefaultRouteForRole } from '../utils/roleRoutes.js'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return children
}

export default ProtectedRoute