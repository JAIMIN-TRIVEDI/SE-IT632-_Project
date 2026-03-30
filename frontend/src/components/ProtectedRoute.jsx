import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  // TODO: Replace this mockup with actual authentication and context logic
  const mockUserRole = localStorage.getItem('userRole'); 
  
  // If we don't even have a userRole mocked, redirect to login
  if (!mockUserRole) {
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required and user lacks it, redirect them to their own dashboard
  if (allowedRole && mockUserRole !== allowedRole) {
    return <Navigate to={`/dashboard/${mockUserRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
