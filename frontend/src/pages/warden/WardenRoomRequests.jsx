import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../api/api";

const STATUS_OPTIONS = ["pending", "approved", "rejected", "all"];

function WardenRoomRequests({ searchQuery }) {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState("");
  const [rejectDialog, setRejectDialog] = useState({ open: false, request: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const loadRequests = async (nextStatus = status) => {
    setLoading(true);
    try {
      const res = await api.get(`/room-requests/warden?status=${nextStatus}`);
      setRequests(res.data?.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load room requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(status);
  }, [status]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery?.trim()) return requests;
    const q = searchQuery.toLowerCase();

    return requests.filter((request) => {
      const student = request.studentId || {};
      const room = request.roomId || {};
      const hostel = request.hostelId || {};

      return (
        student.name?.toLowerCase().includes(q) ||
        student.email?.toLowerCase().includes(q) ||
        student.enrollmentNo?.toLowerCase().includes(q) ||
        hostel.name?.toLowerCase().includes(q) ||
        String(room.roomNumber || "").toLowerCase().includes(q) ||
        request.status?.toLowerCase().includes(q)
      );
    });
  }, [requests, searchQuery]);

  const handleReview = async ({ requestId, action, reason = "" }) => {
    try {
      setActingId(requestId);
      await api.put(`/room-requests/${requestId}/review`, {
        action,
        reason,
      });
      await loadRequests(status);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process request.");
    } finally {
      setActingId("");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Room Requests
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Approve or reject room requests for your assigned hostel.
          </Typography>
        </Box>

        <Select
          size="small"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          {STATUS_OPTIONS.map((item) => (
            <MenuItem key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {filteredRequests.length === 0 ? (
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">
            No room requests found for this filter.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredRequests.map((request) => {
            const student = request.studentId || {};
            const room = request.roomId || {};
            const hostel = request.hostelId || {};
            const isPending = request.status === "pending";
            const isBusy = actingId === request._id;

            return (
              <Grid item xs={12} md={6} key={request._id}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.2,
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography fontWeight={800}>
                      {student.name || "Student"}
                    </Typography>
                    <Chip
                      label={request.status}
                      color={
                        request.status === "approved"
                          ? "success"
                          : request.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                    />
                  </Box>

                  <Stack spacing={0.5} sx={{ mb: 1.2 }}>
                    <Typography fontSize={13} color="text.secondary">
                      Email: {student.email || "N/A"}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Enrollment: {student.enrollmentNo || "N/A"}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Course/Year: {student.course || "N/A"}
                      {student.studyYear ? ` • Year ${student.studyYear}` : ""}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.4} sx={{ mb: 1.5 }}>
                    <Typography fontWeight={700}>
                      {hostel.name || "Hostel"} • Room {room.roomNumber || "-"}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Type: {room.roomType || "N/A"} • Capacity: {room.capacity || "-"} • Occupied: {room.occupiedCount || 0}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Requested mode: {request.requestMode || "random"}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Amount: INR {Number(request.amount || 0).toLocaleString()}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Payment status: {request.paymentStatus}
                    </Typography>
                  </Stack>

                  {request.rejectionReason ? (
                    <Alert severity="info" sx={{ mb: 1.5 }}>
                      Reason: {request.rejectionReason}
                    </Alert>
                  ) : null}

                  <Stack direction="row" spacing={1.2}>
                    <Button
                      variant="contained"
                      disabled={!isPending || isBusy}
                      onClick={() => handleReview({ requestId: request._id, action: "approve" })}
                    >
                      {isBusy ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={!isPending || isBusy}
                      onClick={() => {
                        setRejectDialog({ open: true, request });
                        setRejectionReason("");
                      }}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, request: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Room Request</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.2 }} color="text.secondary">
            Provide a reason to help the student submit a better request.
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Example: Selected room is no longer available"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, request: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!rejectDialog.request) return;
              await handleReview({
                requestId: rejectDialog.request._id,
                action: "reject",
                reason: rejectionReason,
              });
              setRejectDialog({ open: false, request: null });
            }}
            disabled={actingId === rejectDialog.request?._id}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WardenRoomRequests;
