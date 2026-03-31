import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import WardenDashboard from "./pages/WardenDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ApplyRoom from "./pages/ApplyRoom.jsx";
import MessAdminDashboard from "./pages/MessAdminDashboard.jsx";
import MessMenu from "./pages/MessMenu.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import getTheme from "./styles/theme.js";
import "./styles/app.css";

function App() {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const storedMode = localStorage.getItem("color-mode");
    if (storedMode === "light" || storedMode === "dark") {
      setMode(storedMode);
    }
  }, []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const handleToggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("color-mode", next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>
        <Routes>
          {/* Landing */}
          <Route
            path="/"
            element={
              <RootLayout>
                <LandingPage mode={mode} onToggleTheme={handleToggleTheme} />
              </RootLayout>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ✅ STUDENT */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/mess-menu"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <MessMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/apply-room"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ApplyRoom />
              </ProtectedRoute>
            }
          />

          {/* ✅ WARDEN */}
          <Route
            path="/warden/dashboard"
            element={
              <ProtectedRoute allowedRoles={["warden"]}>
                <WardenDashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅ ADMIN */}
          <Route
            path="/hostel-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["hostel_admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          ✅ MESS ADMIN
          <Route
            path="/mess-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["mess_admin"]}>
                <MessAdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
