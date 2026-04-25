import { useState, useEffect } from "react";
// import { Alert, Box, CircularProgress } from '@mui/material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarNav from "../components/dashboard/SidebarNav.jsx";
import TopBar from "../components/dashboard/TopBar.jsx";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import StatsGrid from "../components/dashboard/StatsGrid.jsx";
import RevenueChartCard from "../components/dashboard/RevenueChartCard.jsx";
import RecentActivityCard from "../components/dashboard/RecentActivityCard.jsx";
import PendingFeesCard from "../components/dashboard/PendingFeesCard.jsx";
import HostelsView from "../components/dashboard/admin/HostelsView.jsx";
import StudentsView from "../components/dashboard/admin/StudentsView.jsx";
import PaymentsView from "../components/dashboard/admin/payments/PaymentsView.jsx";
import ReportsView from "../components/dashboard/admin/ReportsView.jsx";
import NotificationsView from "../components/dashboard/admin/NotificationsView.jsx";
import api from "../api/api";

const ADMIN_BASE_PATH = "/hostel-admin/dashboard";
const ADMIN_SECTION_TO_PATH = {
  Hostels: "",
  Students: "students",
  Payments: "payments",
  Reports: "reports",
  Notifications: "notifications",
};

const ADMIN_PATH_TO_SECTION = Object.fromEntries(
  Object.entries(ADMIN_SECTION_TO_PATH)
    .filter(([, slug]) => Boolean(slug))
    .map(([label, slug]) => [slug, label]),
);

const getAdminSectionFromPath = (pathname) => {
  const normalized = pathname.replace(/\/+$/, "");
  const segment = normalized.replace(/^\/hostel-admin\/dashboard\/?/, "");
  if (!segment) return "Hostels";
  return ADMIN_PATH_TO_SECTION[segment] || "Hostels";
};

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeNav = getAdminSectionFromPath(location.pathname);

  // ✅ REAL DATA STATE
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigateToSection = (label) => {
    const slug = ADMIN_SECTION_TO_PATH[label];
    const nextPath = slug ? `${ADMIN_BASE_PATH}/${slug}` : ADMIN_BASE_PATH;
    if (location.pathname !== nextPath) {
      navigate(nextPath);
    }
  };

  const fetchDashboard = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/reports/dashboard/admin");
      setDashboardData(res.data?.data || null);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load admin dashboard data.";
      setError(message);
      console.error("Dashboard fetch error:", {
        message,
        status: err.response?.status,
        endpoint: "/reports/dashboard/admin",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH ADMIN DASHBOARD DATA
  useEffect(() => {
    fetchDashboard();
  }, []);

  const renderContent = () => {
    switch (activeNav) {
      case "Hostels":
        return <HostelsView />;

      case "Students":
        return <StudentsView />;

      case "Payments":
        return <PaymentsView />;

      case "Reports":
        return <ReportsView />;

      case "Notifications":
        return <NotificationsView />;

      case "Dashboard":
        break;
      default:
        if (loading) {
          return (
            <Box>
              <Skeleton variant="text" width={220} height={44} sx={{ mb: 2 }} />
              <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap={2}
                mb={3}
              >
                <Skeleton variant="rounded" height={120} />
                <Skeleton variant="rounded" height={120} />
                <Skeleton variant="rounded" height={120} />
                <Skeleton variant="rounded" height={120} />
              </Box>
              <Box display="grid" gridTemplateColumns="2fr 1fr" gap={2}>
                <Skeleton variant="rounded" height={280} />
                <Skeleton variant="rounded" height={280} />
              </Box>
            </Box>
          );
        }

        if (error) {
          return (
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchDashboard}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          );
        }

        if (!dashboardData) {
          return (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" mb={1}>
                No dashboard data available
              </Typography>
              <Typography color="text.secondary" mb={2}>
                Please refresh to fetch admin dashboard metrics.
              </Typography>
              <Button
                variant="outlined"
                onClick={fetchDashboard}
                sx={{ textTransform: "none" }}
              >
                Reload
              </Button>
            </Box>
          );
        }

        return <HostelsView />;
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
      <SidebarNav activeNav={activeNav} onSelect={navigateToSection} />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />

        <Box sx={{ p: 3, flexGrow: 1 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
