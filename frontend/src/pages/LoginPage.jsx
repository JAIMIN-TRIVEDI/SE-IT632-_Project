import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthBranding from "../components/AuthBranding.jsx";
import FormInput from "../components/FormInput.jsx";
import SocialAuthButtons from "../components/SocialAuthButtons.jsx";
import api from "../api/api.js";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Save token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const roleRoutes = {
        student: "/student/dashboard",
        warden: "/warden/dashboard",
        hostel_admin: "/hostel-admin/dashboard",
        mess_admin: "/mess-admin/dashboard",
      };

      navigate(roleRoutes[data.user.role]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AuthBranding
        title="Your home away from home."
        description="Join thousands of students managing their stays effortlessly with our modern hostel management platform."
        backgroundImage="/src/assets/images/Image.png"
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please enter your details to sign in.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="📧"
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon="🔒"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link
                  component="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/forgot-password");
                  }}
                  underline="none"
                  sx={{ fontWeight: 600, color: "primary.main", fontSize: 14 }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  py: 1.5,
                  boxShadow: "0 4px 20px rgba(47, 97, 255, 0.3)",
                  "&:hover": { boxShadow: "0 6px 28px rgba(47, 97, 255, 0.4)" },
                }}
              >
                {loading ? "Signing in..." : "Sign in to Account"}
              </Button>

              <SocialAuthButtons />

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/register");
                    }}
                    underline="none"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    Register now
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
