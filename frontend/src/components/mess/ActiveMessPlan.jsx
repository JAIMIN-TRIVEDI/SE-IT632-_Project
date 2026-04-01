import { useEffect, useState } from "react";
import { Card, Typography, Button, CircularProgress } from "@mui/material";
import api from "../api/api";

export default function ActiveMessPlan() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    try {
      const res = await api.get("/mess/subscription/me");
      setSubscription(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel mess plan? Refund will be processed.")) return;

    setCanceling(true);
    try {
      const res = await api.post("/mess/subscription/cancel");
      alert(`Refund Requested: ₹${res.data.refundAmount}`);
      fetchSub();
    } catch (err) {
      alert("Error cancelling");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <CircularProgress />;

  if (!subscription) return <Typography>No active plan</Typography>;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">
        {subscription.planId?.name}
      </Typography>

      <Typography>
        Ends on: {new Date(subscription.endDate).toDateString()}
      </Typography>

      <Typography color="success.main">
        Status: {subscription.status}
      </Typography>

      {subscription.status === "active" && (
        <Button
          color="error"
          variant="contained"
          onClick={handleCancel}
          disabled={canceling}
        >
          {canceling ? "Processing..." : "Cancel Plan"}
        </Button>
      )}

      {subscription.status === "refund_pending" && (
        <Typography color="warning.main">
          Refund Pending (₹{subscription.refund?.amount})
        </Typography>
      )}
    </Card>
  );
}