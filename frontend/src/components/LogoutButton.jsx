import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import api from '../api/api'

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // ignore backend logout errors; still clear session
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      onClick={handleLogout}
      sx={{ borderRadius: 2, textTransform: 'none' }}
    >
      Logout
    </Button>
  )
}

export default LogoutButton
