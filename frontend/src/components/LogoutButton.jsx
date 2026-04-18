import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../context/AuthContext.jsx";

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      onClick={handleLogout}
      sx={{ borderRadius: 2, textTransform: "none" }}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;
