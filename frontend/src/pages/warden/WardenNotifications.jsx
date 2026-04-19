import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { NotificationsActive, Search, Send } from "@mui/icons-material";
import api from "../../api/api";
import NotificationCard from "../../components/notifications/NotificationCard";
import NotificationList from "../../components/notifications/NotificationList";
import NotificationsList from "../../components/notifications/NotificationsList.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { connectSocketForUser } from "../../services/socket";
import {
  deleteNotificationById,
  fetchSentWardenNotifications,
  sendWardenNotification,
} from "../../services/notificationService";

const targetTypeOptions = [
  { value: "all", label: "All Students" },
  { value: "users", label: "Specific Students" },
];

const tabs = [
  { value: "all", label: "All Received Notifications" },
  { value: "sent", label: "Sent Messages" },
  { value: "compose", label: "Send Message" },
  { value: "archived", label: "Archived" },
];

const initialForm = {
  title: "",
  message: "",
  targetType: "all",
  targetUsers: [],
};

export default function WardenNotifications({ searchQuery = "" }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [userOptions, setUserOptions] = useState([]);
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [archivedNotifications, setArchivedNotifications] = useState([]);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [receivedRes, sentItems, archivedItems, studentsRes] =
        await Promise.all([
          api.get("/notifications"),
          fetchSentWardenNotifications(),
          fetchSentWardenNotifications({ deleted: "only" }),
          api.get("/notifications/targets/students"),
        ]);

      setReceivedNotifications(
        Array.isArray(receivedRes.data?.data) ? receivedRes.data.data : [],
      );
      setSentNotifications(Array.isArray(sentItems) ? sentItems : []);
      setArchivedNotifications(
        Array.isArray(archivedItems) ? archivedItems : [],
      );

      const studentItems = studentsRes.data?.data || [];
      setUserOptions(
        studentItems.map((student) => ({
          id: student._id,
          label: `${student.name} (${student.enrollmentNo || student.email || "Student"})`,
        })),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load notification dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setSearch(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    if (!user?._id) return undefined;

    const socket = connectSocketForUser(user._id);
    if (!socket) return undefined;

    const handleNewNotification = (data) => {
      if (!data?._id) return;
      setReceivedNotifications((prev) => {
        if (prev.some((item) => item._id === data._id)) return prev;
        return [data, ...prev];
      });
    };

    const handleDeleteNotification = ({
      id,
      ids = [],
      notificationBatchId,
    }) => {
      setSentNotifications((prev) =>
        prev.filter((item) => {
          if (ids.includes(item._id)) return false;
          if (id && item._id === id) return false;
          if (
            notificationBatchId &&
            item.notificationBatchId === notificationBatchId
          )
            return false;
          return true;
        }),
      );

      setReceivedNotifications((prev) =>
        prev.filter((item) => {
          if (ids.includes(item._id)) return false;
          if (id && item._id === id) return false;
          if (
            notificationBatchId &&
            item.notificationBatchId === notificationBatchId
          )
            return false;
          return true;
        }),
      );
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("delete_notification", handleDeleteNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("delete_notification", handleDeleteNotification);
    };
  }, [user?._id]);

  const selectedUserOptions = useMemo(
    () => userOptions.filter((option) => form.targetUsers.includes(option.id)),
    [form.targetUsers, userOptions],
  );

  const filteredReceivedNotifications = useMemo(() => {
    const q = search.trim().toLowerCase();

    return receivedNotifications.filter((item) => {
      if (!q) return true;
      const text =
        `${item.title || ""} ${item.message || ""} ${item.type || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [receivedNotifications, search]);

  const filteredSentNotifications = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sentNotifications.filter((item) => {
      if (String(item.status || "").toLowerCase() !== "sent") return false;

      if (!q) return true;
      const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [search, sentNotifications]);

  const filteredArchivedNotifications = useMemo(() => {
    const q = search.trim().toLowerCase();

    return archivedNotifications.filter((item) => {
      if (!q) return true;
      const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [archivedNotifications, search]);

  const unreadReceivedCount = useMemo(
    () => receivedNotifications.filter((item) => !item.isRead).length,
    [receivedNotifications],
  );

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setReceivedNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );
    } catch (err) {
      setToast({
        open: true,
        severity: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to mark as read.",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await api.put("/notifications/read-all");
      setReceivedNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      setToast({
        open: true,
        severity: "success",
        message: "All notifications marked as read.",
      });
    } catch (err) {
      setToast({
        open: true,
        severity: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to mark all as read.",
      });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTargetTypeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      targetType: value,
      targetUsers: value === "users" ? prev.targetUsers : [],
    }));
  };

  const handleSend = async () => {
    try {
      setSending(true);
      setError("");

      const payload = {
        title: form.title,
        message: form.message,
        targetType: form.targetType,
      };

      if (form.targetType === "users") payload.targetUsers = form.targetUsers;

      const result = await sendWardenNotification(payload);

      const newItem = {
        _id: result?.id || `${Date.now()}`,
        notificationBatchId: result?.notificationBatchId || null,
        title: result?.title || form.title,
        message: result?.message || form.message,
        messagePreview: (result?.message || form.message || "").slice(0, 140),
        targetType: result?.targetType || form.targetType,
        status: "sent",
        recipientCount: result?.recipients || 0,
        createdAt: result?.createdAt || new Date().toISOString(),
      };

      setSentNotifications((prev) => [newItem, ...prev]);
      setForm(initialForm);
      setActiveTab("sent");

      setToast({
        open: true,
        severity: "success",
        message: `Notification sent to ${newItem.recipientCount} students.`,
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to send notification.";
      setError(message);
      setToast({ open: true, severity: "error", message });
    } finally {
      setSending(false);
    }
  };

  const askDelete = (item) => {
    setDeleteDialog({ open: true, item });
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, item: null });
  };

  const confirmDelete = async () => {
    const current = deleteDialog.item;
    if (!current?._id) return;

    const previous = sentNotifications;
    setSentNotifications((prev) =>
      prev.filter((item) => item._id !== current._id),
    );
    cancelDelete();

    try {
      await deleteNotificationById(current._id);
      setToast({
        open: true,
        severity: "success",
        message: "Notification deleted",
      });
      fetchData();
    } catch (err) {
      setSentNotifications(previous);
      setToast({
        open: true,
        severity: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete notification.",
      });
    }
  };

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <NotificationsActive sx={{ color: "primary.main", fontSize: 28 }} />
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Notifications
          </Typography>
          <Typography color="text.secondary">
            Manage and send student notifications from one dashboard.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{ mb: 2 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {activeTab === "compose" ? (
            <Stack spacing={2} sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                Send Message Form
              </Typography>

              <TextField
                label="Title"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="Enter notification title"
                fullWidth
              />

              <TextField
                label="Message"
                value={form.message}
                onChange={(event) =>
                  handleChange("message", event.target.value)
                }
                placeholder="Enter notification message"
                multiline
                minRows={4}
                fullWidth
              />

              <TextField
                select
                label="Target Type"
                value={form.targetType}
                onChange={(event) => handleTargetTypeChange(event.target.value)}
                fullWidth
              >
                {targetTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {form.targetType === "users" ? (
                <Autocomplete
                  multiple
                  options={userOptions}
                  getOptionLabel={(option) => option.label}
                  value={selectedUserOptions}
                  onChange={(_, next) =>
                    handleChange(
                      "targetUsers",
                      next.map((entry) => entry.id),
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Students"
                      placeholder="Choose students"
                    />
                  )}
                />
              ) : null}

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={
                    sending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Send />
                    )
                  }
                  disabled={sending}
                  onClick={handleSend}
                  sx={{ textTransform: "none" }}
                >
                  {sending ? "Sending..." : "Send Notification"}
                </Button>
              </Box>
            </Stack>
          ) : (
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : activeTab === "compose" ? null : activeTab === "archived" ? (
            filteredArchivedNotifications.length ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {filteredArchivedNotifications.map((item) => (
                  <NotificationCard
                    key={item.notificationBatchId || item._id}
                    item={item}
                    query={search}
                    isClickable={false}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No archived notifications yet
                </Typography>
                <Typography color="text.secondary">
                  Recently deleted sent notifications will appear here.
                </Typography>
              </Box>
            )
          ) : activeTab === "all" ? (
            <NotificationsList
              notifications={receivedNotifications}
              loading={loading}
              search={search}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              tab={0}
              unreadCount={unreadReceivedCount}
              markingAll={markingAll}
              showSearch={false}
              showMarkAllButton
              emptyMessage="No received notifications found"
              emptyDescription="New notifications will appear here."
            />
          ) : (
            <NotificationList
              items={filteredSentNotifications}
              onDelete={askDelete}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notification?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          variant="filled"
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
