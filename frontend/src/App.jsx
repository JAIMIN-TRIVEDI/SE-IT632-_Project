import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import RootLayout from "./layouts/RootLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import HomeLinkedPage from "./pages/HomeLinkedPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import WardenDashboard from "./pages/WardenDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ApplyRoom from "./pages/ApplyRoom.jsx";
import MessAdminDashboard from "./pages/MessAdminDashboard.jsx";
import MessPlans from "./pages/MessPlans.jsx";
import MessMenu from "./pages/MessMenu.jsx";
import ApplyMessPlan from "./pages/ApplyMessPlan.jsx";
import MessAdminLayout from "./layouts/MessAdminLayout.jsx";
import MessRecords from "./pages/MessRecords.jsx";
import MessMenuManagement from "./pages/MessMenuManagement.jsx";
import MessAdminProfile from "./pages/MessAdminProfile.jsx";
import MessNotifications from "./pages/MessNotifications.jsx";
import MessReports from "./pages/MessReports.jsx";
import MessSubscriptions from "./pages/MessSubscriptions.jsx";
import MessStudents from "./pages/MessStudents.jsx";
import MessPayments from "./pages/MessPayments.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { getDefaultRouteForRole } from "./utils/roleRoutes.js";

import getTheme from "./styles/theme.js";
import "./styles/app.css";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, hash]);

  return null;
}

function HomeEntry({ mode, onToggleTheme }) {
  const { isInitializing, isAuthenticated, user } = useAuth();

  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return (
    <RootLayout>
      <LandingPage mode={mode} onToggleTheme={onToggleTheme} />
    </RootLayout>
  );
}

function App() {
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem("color-mode");
    return storedMode === "light" || storedMode === "dark"
      ? storedMode
      : "light";
  });

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
        <AuthProvider>
          <ScrollManager />
          <Routes>
            {/* Landing */}
            <Route
              path="/"
              element={
                <HomeEntry mode={mode} onToggleTheme={handleToggleTheme} />
              }
            />
            <Route
              path="/about"
              element={
                <RootLayout>
                  <AboutPage mode={mode} onToggleTheme={handleToggleTheme} />
                </RootLayout>
              }
            />
            <Route
              path="/info/:slug"
              element={
                <RootLayout>
                  <HomeLinkedPage
                    mode={mode}
                    onToggleTheme={handleToggleTheme}
                  />
                </RootLayout>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* ✅ STUDENT */}
            <Route
              path="/student/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard
                    mode={mode}
                    onToggleTheme={handleToggleTheme}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/mess-menu"
              element={
                <ProtectedRoute allowedRoles={["student", "mess_admin"]}>
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
            <Route
              path="/student/mess-plan"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ApplyMessPlan />
                </ProtectedRoute>
              }
            />

            {/* ✅ WARDEN */}
            <Route
              path="/warden/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["warden"]}>
                  <WardenDashboard
                    mode={mode}
                    onToggleTheme={handleToggleTheme}
                  />
                </ProtectedRoute>
              }
            />

            {/* ✅ ADMIN */}
            <Route
              path="/hostel-admin/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["hostel_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ MESS ADMIN */}
            <Route
              path="/mess-admin"
              element={
                <ProtectedRoute allowedRoles={["mess_admin"]}>
                  <MessAdminLayout
                    mode={mode}
                    onToggleTheme={handleToggleTheme}
                  />
                </ProtectedRoute>
              }
            >
              <Route index element={<MessAdminDashboard />} />
              <Route path="dashboard" element={<MessAdminDashboard />} />
              <Route path="plans" element={<MessPlans />} />
              <Route path="records" element={<MessRecords />} />
              <Route path="subscriptions" element={<MessSubscriptions />} />
              <Route path="students" element={<MessStudents />} />
              <Route path="payments" element={<MessPayments />} />
              <Route path="menu" element={<MessMenuManagement />} />
              <Route path="notifications" element={<MessNotifications />} />
              <Route path="reports" element={<MessReports />} />
              <Route path="profile" element={<MessAdminProfile />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
