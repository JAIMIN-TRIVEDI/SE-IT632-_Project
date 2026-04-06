import { useEffect, useState } from "react";
import { Card, Typography, Button, CircularProgress } from "@mui/material";
import api from "../api/api";

export default function ActiveMessPlan() {
  const [subscription, setSubscription] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const cancellationRequested = currentStatus === "cancellation_requested";
  const hasActiveAccess = currentStatus === "active" || currentStatus === "cancellation_requested";

  const fetchSub = async () => {
    try {
      const res = await api.get("/mess/subscription/me");
      setSubscription(res.data.data || null);
      setCurrentStatus(res.data.currentStatus || "none");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSub();
  }, []);

  const handleCancel = async () => {
    if (!window.confirm("Cancel mess plan? Refund will be processed.")) return;

    setCanceling(true);
    try {
      const res = await api.post("/mess/subscription/cancel");
      alert(`Cancellation requested. Refund amount: ₹${res.data.refundAmount}`);
      await fetchSub();
    } catch (err) {
      alert(err?.response?.data?.message || "Error cancelling");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <CircularProgress />;

  if (!subscription) return <Typography>No plan found.</Typography>;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">
        {subscription.planId?.name}
      </Typography>

      <Typography>
        Ends on: {new Date(subscription.endDate).toDateString()}
      </Typography>

      <Typography color={cancellationRequested ? "warning.main" : "success.main"}>
        Status: {String(currentStatus || "unknown").replace(/_/g, " ")}
      </Typography>

      {hasActiveAccess && !cancellationRequested && (
        <Button
          color="error"
          variant="contained"
          onClick={handleCancel}
          disabled={canceling}
        >
          {canceling ? "Processing..." : "Cancel Plan"}
        </Button>
      )}

      {cancellationRequested && (
        <Typography color="warning.main">
          Requested for cancellation (Refund: ₹{subscription.refund?.amount})
        </Typography>
      )}
    </Card>
  );
}