import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Alert,
  TextField,
} from "@mui/material";
import {
  approveRefund,
  getPendingRefunds,
  rejectRefund,
} from "../services/messService";
import { useSearch } from "../hooks/useSearch";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getPaymentReference = (subscription) =>
  subscription?.latestPayment?.paymentId ||
  subscription?.latestPayment?.orderId ||
  subscription?.latestPayment?._id ||
  "Not available";

function MessSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [actionType, setActionType] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [transferReference, setTransferReference] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { search, setSearch, isDebouncing, debouncedSearch } = useSearch(
    "",
    400,
  );

  const fetchPendingRefunds = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getPendingRefunds();
      setSubscriptions(response?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending refund requests.",
      );
      setSnack({
        open: true,
        message: "Unable to load pending refund requests.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedSubscription(null);
    setTransferReference("");
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedSubscription(null);
    setRejectionReason("");
  };

  const handleApproveRefund = async () => {
    if (!selectedSubscription?._id) return;

    try {
      setActionLoadingId(selectedSubscription._id);
      setActionType("approve");
      await approveRefund(selectedSubscription._id, {
        confirmTransfer: true,
        transferReference: transferReference.trim(),
      });
      setSubscriptions((prev) => prev.filter((sub) => sub._id !== selectedSubscription._id));
      closeApproveDialog();
      setSnack({
        open: true,
        message: "Refund approved successfully.",
        severity: "success",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve refund.",
      );
      setSnack({
        open: true,
        message: "Failed to approve refund.",
        severity: "error",
      });
    } finally {
      setActionLoadingId("");
      setActionType("");
    }
  };

  const handleRejectRefund = async () => {
    if (!selectedSubscription?._id) return;

    try {
      setActionLoadingId(selectedSubscription._id);
      setActionType("reject");
      await rejectRefund(selectedSubscription._id, { reason: rejectionReason.trim() });
      setSubscriptions((prev) => prev.filter((sub) => sub._id !== selectedSubscription._id));
      closeRejectDialog();
      setSnack({
        open: true,
        message: "Refund rejected successfully.",
        severity: "success",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject refund.",
      );
      setSnack({
        open: true,
        message: "Failed to reject refund.",
        severity: "error",
      });
    } finally {
      setActionLoadingId("");
      setActionType("");
    }
  };

  useEffect(() => {
    fetchPendingRefunds();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return subscriptions;

    return subscriptions.filter((sub) => {
      const studentName = sub.studentId?.name || "";
      const studentEmail = sub.studentId?.email || "";
      const enrollmentNo = sub.studentId?.enrollmentNo || "";
      const planName = sub.planId?.name || "";

      return [studentName, studentEmail, enrollmentNo, planName].some((value) =>
        String(value).toLowerCase().includes(keyword),
      );
    });
  }, [subscriptions, debouncedSearch]);

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Pending Refund Requests
          </Typography>
          <Typography color="text.secondary">
            Review and process student refund requests.
          </Typography>
        </Box>
        <Card sx={{ minWidth: 240, p: 2, bgcolor: "background.paper" }}>
          <CardContent>
            <Typography fontSize={12} color="text.secondary" gutterBottom>
              Pending requests
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {filteredSubscriptions.length}
            </Typography>
          </CardContent>
        </Card>
        <Button
          variant="outlined"
          onClick={fetchPendingRefunds}
          disabled={loading || Boolean(actionLoadingId)}
          sx={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by student, enrollment, email, or plan"
          fullWidth
          size="small"
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchPendingRefunds}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading || isDebouncing ? (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Refund Amount</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Requested At</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton variant="text" height={34} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Refund Amount</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Requested At</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    {search.trim()
                      ? "No matching refund requests found."
                      : "No pending refund requests."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub._id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {sub.studentId?.name || "Unknown"}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {sub.studentId?.email || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {sub.planId?.name || "Plan not found"}
                      </Typography>
                      <Chip
                        label={sub.status || "refund_pending"}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>₹{sub.refund?.amount ?? 0}</TableCell>
                    <TableCell>{sub.refund?.reason || "—"}</TableCell>
                    <TableCell>
                      {sub.refund?.requestedAt
                        ? new Date(sub.refund.requestedAt).toLocaleString(
                            "en-IN",
                          )
                        : sub.updatedAt
                          ? new Date(sub.updatedAt).toLocaleString("en-IN")
                          : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() => {
                            setSelectedSubscription(sub);
                            setApproveDialogOpen(true);
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          {actionLoadingId === sub._id &&
                          actionType === "approve"
                            ? "Approving..."
                            : "Approve"}
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          disabled={Boolean(actionLoadingId)}
                          onClick={() => {
                            setSelectedSubscription(sub);
                            setRejectDialogOpen(true);
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          {actionLoadingId === sub._id &&
                          actionType === "reject"
                            ? "Rejecting..."
                            : "Reject"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={approveDialogOpen}
        onClose={actionLoadingId ? undefined : closeApproveDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Approve Refund</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1.2 }}>
            <Typography>
              Student: {selectedSubscription?.studentId?.name || "Unknown"}
            </Typography>
            <Typography color="text.secondary">
              {selectedSubscription?.studentId?.email || "—"}
            </Typography>
            <Typography>
              Refund Amount: {formatCurrency(selectedSubscription?.refund?.amount || 0)}
            </Typography>
            <Typography>
              Paid From (Razorpay ref): {getPaymentReference(selectedSubscription)}
            </Typography>
            <Alert severity="info" sx={{ mt: 1 }}>
              Complete the transfer in Razorpay first, then enter transaction reference below.
            </Alert>
            <TextField
              label="Razorpay Transfer Transaction ID"
              placeholder="Example: payout_abc123 or UTR/reference"
              value={transferReference}
              onChange={(event) => setTransferReference(event.target.value)}
              fullWidth
              size="small"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApproveDialog} disabled={Boolean(actionLoadingId)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApproveRefund}
            disabled={Boolean(actionLoadingId) || !transferReference.trim()}
          >
            {actionType === "approve" && actionLoadingId ? "Approving..." : "Approve Refund"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onClose={actionLoadingId ? undefined : closeRejectDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Refund</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1.2 }}>
            <Typography>
              Student: {selectedSubscription?.studentId?.name || "Unknown"}
            </Typography>
            <TextField
              label="Reason (optional)"
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              fullWidth
              size="small"
              multiline
              minRows={2}
              inputProps={{ maxLength: 300 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog} disabled={Boolean(actionLoadingId)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRejectRefund}
            disabled={Boolean(actionLoadingId)}
          >
            {actionType === "reject" && actionLoadingId ? "Rejecting..." : "Reject Refund"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MessSubscriptions;
