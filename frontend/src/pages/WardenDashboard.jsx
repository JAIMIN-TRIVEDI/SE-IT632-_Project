import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import WardenSidebarNav from "../components/dashboard/warden/WardenSidebarNav.jsx";
import WardenTopBar from "../components/dashboard/warden/WardenTopBar.jsx";
import WardenStatCard from "../components/dashboard/warden/WardenStatCard.jsx";
import WardenActivityTableCard from "../components/dashboard/warden/WardenActivityTableCard.jsx";
import WardenAnnouncementsCard from "../components/dashboard/warden/WardenAnnouncementsCard.jsx";
import WardenAvailabilityCard from "../components/dashboard/warden/WardenAvailabilityCard.jsx";
import WardenRooms from "./warden/WardenRooms.jsx";
import WardenRoomRequests from "./warden/WardenRoomRequests.jsx";
import WardenVacateRequests from "./warden/WardenVacateRequests.jsx";
import WardenComplaints from "./warden/WardenComplaints.jsx";
import WardenStudents from "./warden/WardenStudents.jsx";
import WardenProfile from "./warden/WardenProfile.jsx";
import WardenNotifications from "./warden/WardenNotifications.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { connectSocketForUser } from "../services/socket";
import api from "../api/api";

const WARDEN_BASE_PATH = "/warden/dashboard";
const WARDEN_SECTION_TO_PATH = {
  Dashboard: "",
  Rooms: "rooms",
  "Room Requests": "room-requests",
  "Vacate Requests": "vacate-requests",
  Complaints: "complaints",
  Students: "students",
  Notifications: "notifications",
  Profile: "profile",
};

const WARDEN_PATH_TO_SECTION = Object.fromEntries(
  Object.entries(WARDEN_SECTION_TO_PATH)
    .filter(([, slug]) => Boolean(slug))
    .map(([label, slug]) => [slug, label]),
);

const getWardenSectionFromPath = (pathname) => {
  const normalized = pathname.replace(/\/+$/, "");
  const segment = normalized.replace(/^\/warden\/dashboard\/?/, "");
  if (!segment) return "Dashboard";
  return WARDEN_PATH_TO_SECTION[segment] || "Dashboard";
};

function WardenDashboard({ mode = "light", onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const activeNav = getWardenSectionFromPath(location.pathname);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigateToSection = useCallback(
    (label) => {
      const slug = WARDEN_SECTION_TO_PATH[label];
      const nextPath = slug ? `${WARDEN_BASE_PATH}/${slug}` : WARDEN_BASE_PATH;
      if (location.pathname !== nextPath) {
        navigate(nextPath);
      }
    },
    [location.pathname, navigate],
  );

  const fetchDashboardData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const res = await api.get("/warden/dashboard");
      setDashboardData(res.data?.data || {});
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load warden dashboard data.",
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData({ silent: true }).catch(() => {});
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = connectSocketForUser(user._id);
    if (!socket) return undefined;

    const handleWardenUpdate = () => {
      fetchDashboardData({ silent: true }).catch(() => {});
    };

    socket.on("warden_update", handleWardenUpdate);

    return () => {
      socket.off("warden_update", handleWardenUpdate);
    };
  }, [fetchDashboardData, user?._id]);

  useEffect(() => {
    setSearchQuery("");
  }, [activeNav]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const getSearchPlaceholder = () => {
    switch (activeNav) {
      case "Rooms":
        return "Search hostels, blocks, or room statuses...";
      case "Complaints":
        return "Search complaints by student, room or category...";
      case "Room Requests":
        return "Search room requests by student, room, or hostel...";
      case "Vacate Requests":
        return "Search vacate requests by student, room, hostel, or reason...";
      case "Students":
        return "Search students by name, hostel or room...";
      case "Notifications":
        return "Search alerts and updates...";
      case "Profile":
        return "Search profile fields...";
      default:
        return "Search student or room...";
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case "Rooms":
        return <WardenRooms searchQuery={searchQuery} />;
      case "Complaints":
        return <WardenComplaints searchQuery={searchQuery} />;
      case "Room Requests":
        return <WardenRoomRequests searchQuery={searchQuery} />;
      case "Vacate Requests":
        return <WardenVacateRequests searchQuery={searchQuery} />;
      case "Students":
        return <WardenStudents searchQuery={searchQuery} />;
      case "Notifications":
        return <WardenNotifications searchQuery={searchQuery} />;
      case "Profile":
        return <WardenProfile />;
      case "Dashboard":
      default:
        return (
          <>
            <Box display="flex" gap={2.5} flexWrap="wrap">
              {stats.map((stat) => (
                <WardenStatCard key={stat.label} {...stat} />
              ))}
            </Box>
            <Box
              display="flex"
              gap={2.5}
              alignItems="flex-start"
              flexWrap="wrap"
            >
              <WardenActivityTableCard
                items={dashboardData?.recentActivity || []}
                sx={{ minWidth: { xs: '100%', lg: 360 }, flex: 2 }}
              />
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                gap={2.5}
                sx={{ minWidth: { xs: '100%', lg: 320 } }}
              >
                <WardenAnnouncementsCard
                  items={dashboardData?.announcements || []}
                />
                <WardenAvailabilityCard
                  roomAvailability={dashboardData?.roomAvailability || {}}
                />
              </Box>
            </Box>
          </>
        );
    }
  };

  const stats = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        label: "Total Rooms",
        value: `${dashboardData.totalRooms ?? 0}`,
        sub: `Capacity: ${dashboardData.totalCapacity ?? 0}`,
        badge: "Stable",
        badgeTrend: "up",
        iconEmoji: "🏠",
        iconBg: "#eff6ff",
        iconColor: "#2563eb",
      },
      {
        label: "Pending Complaints",
        value: `${dashboardData.pendingComplaints ?? 0}`,
        sub: "Need your attention",
        badge: "Updated",
        badgeTrend: "up",
        icon: null,
        iconEmoji: "⚠️",
        iconBg: "#fef2f2",
        iconColor: "#dc2626",
      },
      {
        label: "Students On-leave",
        value: `${dashboardData.studentsOnLeave ?? 0}`,
        sub: `Occupied Rooms: ${dashboardData.occupiedRooms ?? 0}`,
        badge: "Live",
        badgeTrend: "down",
        icon: null,
        iconEmoji: "✈️",
        iconBg: "#fff7ed",
        iconColor: "#ea580c",
      },
    ];
  }, [dashboardData]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rounded" height={64} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
          <Skeleton variant="rounded" height={280} />
          <Skeleton variant="rounded" height={280} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" mb={1}>
          No dashboard data available
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Try reloading to fetch the latest records.
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchDashboardData}
          sx={{ textTransform: "none" }}
        >
          Reload
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <WardenSidebarNav activeNav={activeNav} onSelect={navigateToSection} />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <WardenTopBar
          activeNav={activeNav}
          mode={mode}
          onToggleTheme={onToggleTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={getSearchPlaceholder()}
        />
        <Box
          sx={{
            px: 4,
            pb: 4,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflowY: "auto",
          }}
        >
          {activeNav === "Dashboard" ? (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  refreshing ? (
                    <CircularProgress size={14} />
                  ) : (
                    <Refresh fontSize="small" />
                  )
                }
                onClick={() => fetchDashboardData({ silent: true })}
                disabled={refreshing}
                sx={{ textTransform: "none" }}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </Box>
          ) : null}
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}

export default WardenDashboard;
