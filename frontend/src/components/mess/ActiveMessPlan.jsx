import { useEffect, useState } from "react";
import { Card, Typography, Button, CircularProgress } from "@mui/material";
import api from "../api/api";

export default function ActiveMessPlan() {
  const [subscription, setSubscription] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const refundRequested = currentStatus === "requested";
  const hasActiveAccess =
    currentStatus === "active" || currentStatus === "requested";

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
    if (!window.confirm("Request refund for this plan?")) return;
    const reason =
      window.prompt("Optional: Enter refund reason (max 300 chars)", "") || "";

    setCanceling(true);
    try {
      const res = await api.post("/refund/request", { reason });
      alert(
        `Refund requested. Amount: ₹${res.data?.data?.refund?.amount ?? 0}`,
      );
      await fetchSub();
    } catch (err) {
      alert(err?.response?.data?.message || "Error requesting refund");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <CircularProgress />;

  if (!subscription) return <Typography>No plan found.</Typography>;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">{subscription.planId?.name}</Typography>

      <Typography>
        Ends on: {new Date(subscription.endDate).toDateString()}
      </Typography>

      <Typography color={refundRequested ? "warning.main" : "success.main"}>
        Status: {String(currentStatus || "unknown").replace(/_/g, " ")}
      </Typography>

      {hasActiveAccess && !refundRequested && (
        <Button
          color="error"
          variant="contained"
          onClick={handleCancel}
          disabled={canceling}
        >
          {canceling ? "Processing..." : "Request Refund"}
        </Button>
      )}

      {refundRequested && (
        <Typography color="warning.main">
          Refund requested (Amount: ₹{subscription.refund?.amount})
        </Typography>
      )}
    </Card>
  );
}
