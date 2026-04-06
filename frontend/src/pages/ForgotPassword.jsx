import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Fade
} from "@mui/material";
import api from "../api/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSuccess("OTP sent to your email ✉️");
      setShowOTP(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });

      setSuccess("Password updated successfully 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(-45deg, #0f172a, #1e3a8a, #6366f1, #9333ea)",
        backgroundSize: "400% 400%",
        animation: "gradientMove 10s ease infinite",
        "@keyframes gradientMove": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <Fade in timeout={800}>
        <Box
          sx={{
            width: 420,
            p: 5,
            borderRadius: "20px",
            backdropFilter: "blur(25px)",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
            color: "#fff",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            mb={3}
          >
            🔐 Reset Password
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          {/* EMAIL */}
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            disabled={showOTP}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#ddd" } }}
            sx={{
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": { borderColor: "#aaa" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
              },
            }}
          />

          {/* OTP + PASSWORD */}
          {showOTP && (
            <>
              <TextField
                fullWidth
                label="Enter OTP"
                margin="normal"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                InputLabelProps={{ style: { color: "#ddd" } }}
                sx={{
                  input: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <TextField
                fullWidth
                type="password"
                label="New Password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#ddd" } }}
                sx={{
                  input: { color: "#fff" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
            </>
          )}

          {/* BUTTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={showOTP ? resetPassword : sendOTP}
            disabled={
              loading ||
              (showOTP ? (!otp || !password) : !email)
            }
            sx={{
              mt: 3,
              py: 1.4,
              fontWeight: "bold",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #9333ea)",
              transition: "0.3s",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 0 20px #6366f1",
              },
            }}
          >
            {loading
              ? "Processing..."
              : showOTP
              ? "Reset Password"
              : "Send OTP"}
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}

export default ForgotPassword;