import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LockIcon from "@mui/icons-material/Lock";
import api from "../api/api";

// ── Razorpay script loader ────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Plan feature list ─────────────────────────────────────────────────────────
const getPlanFeatures = (plan) => [
  { label: "3 Meals per day (Breakfast, Lunch, Dinner)", included: true },
  { label: "Veg & Non-Veg options", included: true },
  { label: "Weekly menu updates", included: true },
  { label: "Special occasion meals", included: plan.durationInDays >= 30 },
  { label: "Priority seating", included: plan.durationInDays >= 30 },
];

// ── Single plan card ──────────────────────────────────────────────────────────
function PlanCard({ plan, isActive, isCurrent, onSelect, loading, locked }) {
  const features = getPlanFeatures(plan);

  return (
    <Card
      onClick={() => !isCurrent && !loading && !locked && onSelect(plan)}
      sx={{
        p: 0,
        border: "2px solid",
        borderColor: isActive
          ? "primary.main"
          : isCurrent
            ? "success.main"
            : locked
              ? "action.disabledBackground"
              : "divider",
        borderRadius: 3,
        cursor: isCurrent || locked ? "default" : "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "visible",
        "&:hover":
          !isCurrent && !locked
            ? {
                borderColor: "primary.main",
                transform: "translateY(-4px)",
                boxShadow: "0 12px 32px rgba(47,97,255,0.15)",
              }
            : {},
        ...(isActive && {
          boxShadow: "0 8px 24px rgba(47,97,255,0.2)",
        }),
      }}
    >
      {/* Badge */}
      {isCurrent && (
        <Chip
          label="Current Plan"
          color="success"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: 700,
            fontSize: 11,
            zIndex: 1,
          }}
        />
      )}
      {locked && !isCurrent && (
        <Chip
          label="Unavailable"
          color="default"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: 700,
            fontSize: 11,
            zIndex: 1,
          }}
        />
      )}
      {plan.durationInDays >= 30 && !isCurrent && (
        <Chip
          label="Most Popular"
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: 700,
            fontSize: 11,
            zIndex: 1,
          }}
        />
      )}

      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: isActive
            ? "linear-gradient(135deg, #2f61ff 0%, #1e40af 100%)"
            : isCurrent
              ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
              : (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "#f8fafc",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <RestaurantMenuIcon
            sx={{
              color:
                isActive || isCurrent
                  ? "rgba(255,255,255,0.9)"
                  : "primary.main",
              fontSize: 20,
            }}
          />
          <Typography
            fontWeight={700}
            fontSize={16}
            color={isActive || isCurrent ? "#fff" : "text.primary"}
          >
            {plan.name}
          </Typography>
        </Box>

        <Box display="flex" alignItems="baseline" gap={0.5}>
          <Typography
            fontWeight={900}
            fontSize={32}
            color={isActive || isCurrent ? "#fff" : "text.primary"}
            lineHeight={1}
          >
            ₹{plan.price.toLocaleString()}
          </Typography>
          <Typography
            fontSize={13}
            color={
              isActive || isCurrent
                ? "rgba(255,255,255,0.75)"
                : "text.secondary"
            }
          >
            / {plan.durationInDays} days
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5} mt={1}>
          <CalendarMonthIcon
            sx={{
              fontSize: 14,
              color:
                isActive || isCurrent
                  ? "rgba(255,255,255,0.7)"
                  : "text.secondary",
            }}
          />
          <Typography
            fontSize={12}
            color={
              isActive || isCurrent ? "rgba(255,255,255,0.7)" : "text.secondary"
            }
          >
            ₹{(plan.price / plan.durationInDays).toFixed(0)}/day
          </Typography>
        </Box>
      </Box>

      {/* Features */}
      <Box p={3}>
        <Box display="flex" flexDirection="column" gap={1.2} mb={3}>
          {features.map((f, i) => (
            <Box key={i} display="flex" alignItems="flex-start" gap={1}>
              {f.included ? (
                <CheckCircleIcon
                  sx={{
                    fontSize: 16,
                    color: "success.main",
                    mt: 0.2,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <CancelIcon
                  sx={{
                    fontSize: 16,
                    color: "text.disabled",
                    mt: 0.2,
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography
                fontSize={13}
                color={f.included ? "text.primary" : "text.disabled"}
                lineHeight={1.4}
              >
                {f.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {isCurrent ? (
          <Button
            fullWidth
            variant="outlined"
            color="success"
            disabled
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
          >
            ✓ Active Plan
          </Button>
        ) : (
          <Button
            fullWidth
            variant={isActive ? "contained" : "outlined"}
            disabled={loading || locked}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              py: 1.2,
              ...(isActive && {
                background: "linear-gradient(135deg, #2f61ff 0%, #1e40af 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1e4fdb 0%, #1a369a 100%)",
                },
              }),
            }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : locked ? (
              "Not available now"
            ) : isActive ? (
              "Pay & Subscribe →"
            ) : (
              "Select Plan"
            )}
          </Button>
        )}
      </Box>
    </Card>
  );
}

function SubscriptionStatusCard({ subscription, currentStatus }) {
  if (!subscription) return null;

  const statusMap = {
    active: {
      label: "Active",
      color: "success",
      message: "Your plan is active.",
    },
    cancellation_requested: {
      label: "Cancellation Requested",
      color: "warning",
      message: `Your cancellation is pending mess admin approval. Refund amount: ₹${subscription.refund?.amount ?? 0}.`,
    },
    cancelled: {
      label: "Cancelled",
      color: "error",
      message:
        "Your plan has been cancelled. You can now purchase a new mess plan.",
    },
    expired: {
      label: "Expired",
      color: "default",
      message:
        "Your previous plan has expired. You can purchase a new mess plan.",
    },
  };

  const current = statusMap[currentStatus] || {
    label: String(currentStatus || "Unknown").replaceAll("_", " "),
    color: "default",
    message: "Current status fetched from backend.",
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        mb: 3,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={0.75}>
        <Typography fontWeight={700} fontSize={14} color="text.secondary">
          Current Plan Status
        </Typography>
        <Chip
          label={current.label}
          color={current.color}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </Box>
      <Typography fontSize={13} color="text.secondary">
        {current.message}
      </Typography>
    </Card>
  );
}

// ── Active subscription banner ────────────────────────────────────────────────
function ActiveSubscriptionBanner({ subscription, onCancel, cancelling }) {
  const cancellationRequested = Boolean(
    subscription.refund?.requested && !subscription.refund?.approved,
  );
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24),
    ),
  );
  const totalDays = subscription.planId?.durationInDays || 30;
  const progress = Math.max(
    0,
    Math.min(100, ((totalDays - daysLeft) / totalDays) * 100),
  );

  return (
    <Card
      sx={{
        p: 3,
        border: "2px solid",
        borderColor: cancellationRequested ? "warning.main" : "success.main",
        borderRadius: 3,
        background: (theme) =>
          cancellationRequested
            ? theme.palette.mode === "dark"
              ? "rgba(245,158,11,0.1)"
              : "rgba(245,158,11,0.08)"
            : theme.palette.mode === "dark"
              ? "rgba(22,163,74,0.1)"
              : "rgba(22,163,74,0.05)",
        mb: 4,
      }}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {cancellationRequested ? (
              <AutorenewIcon sx={{ color: "warning.main", fontSize: 22 }} />
            ) : (
              <CheckCircleIcon sx={{ color: "success.main", fontSize: 22 }} />
            )}
            <Typography
              fontWeight={700}
              fontSize={16}
              color={cancellationRequested ? "warning.main" : "success.main"}
            >
              Active Subscription
            </Typography>
          </Box>
          <Typography fontWeight={800} fontSize={22} color="text.primary">
            {subscription.planId?.name || "Mess Plan"}
          </Typography>
          {cancellationRequested && (
            <Chip
              label="Requested for cancellation"
              color="warning"
              size="small"
              sx={{ mt: 1, fontWeight: 700 }}
            />
          )}
          <Typography fontSize={13} color="text.secondary" mt={0.5}>
            Valid until{" "}
            <strong>
              {new Date(subscription.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography
            fontSize={28}
            fontWeight={900}
            color={daysLeft <= 5 ? "error.main" : "text.primary"}
          >
            {daysLeft}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            days left
          </Typography>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box mt={2} mb={2}>
        <Box
          sx={{
            height: 6,
            bgcolor: "divider",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${progress}%`,
              bgcolor: daysLeft <= 5 ? "error.main" : "success.main",
              borderRadius: 3,
              transition: "width 0.5s ease",
            }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography fontSize={11} color="text.secondary">
            Started{" "}
            {new Date(subscription.startDate).toLocaleDateString("en-IN")}
          </Typography>
          <Typography fontSize={11} color="text.secondary">
            Ends {new Date(subscription.endDate).toLocaleDateString("en-IN")}
          </Typography>
        </Box>
      </Box>

      <Button
        size="small"
        color="error"
        variant="outlined"
        onClick={onCancel}
        disabled={cancelling || cancellationRequested}
        startIcon={cancelling ? <CircularProgress size={14} /> : null}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {cancellationRequested
          ? "Cancellation Requested"
          : cancelling
            ? "Cancelling..."
            : "Cancel Subscription"}
      </Button>
      {cancellationRequested && (
        <Typography color="warning.main" mt={1} fontSize={13}>
          Cancellation requested. Refund amount pending approval: ₹
          {subscription.refund?.amount}
        </Typography>
      )}
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ApplyMessPlan() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("none");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const notify = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const hasActiveAccess =
    currentStatus === "active" || currentStatus === "cancellation_requested";
  const canPurchaseNewPlan = !hasActiveAccess;

  const refreshSubscription = async () => {
    const subRes = await api.get("/mess/subscription/me");
    setSubscription(subRes.data.data || null);
    setCurrentStatus(subRes.data.currentStatus || "none");
    setSelectedPlan(null);
  };

  // ── Fetch plans & current subscription ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          api.get("/mess/plans"),
          api.get("/mess/subscription/me"),
        ]);
        setPlans(plansRes.data.data || []);
        setSubscription(subRes.data.data || null);
        setCurrentStatus(subRes.data.currentStatus || "none");
      } catch {
        setError("Failed to load mess data. Please refresh.");
      } finally {
        setLoadingPlans(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSubscription().catch(() => {});
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // ── Handle plan selection → Razorpay ────────────────────────────────────────
  const handleSelectPlan = async (plan) => {
    if (!canPurchaseNewPlan) {
      notify(
        "You already have an active plan. New purchase is allowed after full cancellation/expiry.",
        "warning",
      );
      return;
    }

    setSelectedPlan(plan);
    setPaying(true);
    setError(null);

    try {
      // 1. Create Razorpay order
      const orderRes = await api.post("/mess/order", { planId: plan._id });
      const { order } = orderRes.data;

      // 2. Fetch Razorpay key
      const keyRes = await api.get("/payments/key");
      const razorpayKey = keyRes.data.key;

      // 3. Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded)
        throw new Error(
          "Could not load Razorpay. Check your internet connection.",
        );

      // 4. Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Hostezy",
        image: "/hostezy_logo.svg",
        description: `Mess Plan: ${plan.name} (${plan.durationInDays} days)`,
        order_id: order.id,
        prefill: {},
        theme: { color: "#2f61ff" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setSelectedPlan(null);
            notify("Payment cancelled.", "warning");
          },
        },
        handler: async (response) => {
          try {
            // 5. Verify payment on backend
            await api.post("/mess/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
            });

            await refreshSubscription();
            setSelectedPlan(null);
            notify(`🎉 You're now subscribed to ${plan.name}!`, "success");
          } catch (verifyErr) {
            setError(
              verifyErr.response?.data?.message ||
                "Payment verification failed.",
            );
            notify("Payment verification failed. Contact support.", "error");
          } finally {
            setPaying(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
        notify("Payment failed. Please try again.", "error");
        setPaying(false);
        setSelectedPlan(null);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setPaying(false);
      setSelectedPlan(null);
    }
  };

  // ── Cancel subscription ──────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!window.confirm("Cancel subscription? Refund will be calculated."))
      return;

    setCancelling(true);
    try {
      const res = await api.post("/mess/subscription/cancel");
      notify(
        `Cancellation requested. Refund amount: ₹${res.data.refundAmount}`,
        "info",
      );
      await refreshSubscription();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to cancel.", "error");
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loadingPlans) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography color="text.secondary" fontSize={14}>
          Loading mess plans…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={800}
          color="text.primary"
          gutterBottom
        >
          Mess Subscription
        </Typography>
        <Typography color="text.secondary" fontSize={14}>
          Choose a plan and pay securely via Razorpay. Your subscription
          activates instantly after payment.
        </Typography>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Subscription status */}
      {subscription && (
        <SubscriptionStatusCard
          subscription={subscription}
          currentStatus={currentStatus}
        />
      )}

      {/* Active subscription banner */}
      {subscription && hasActiveAccess && (
        <ActiveSubscriptionBanner
          subscription={subscription}
          onCancel={handleCancel}
          cancelling={cancelling}
        />
      )}

      {/* Plan grid */}
      {plans.length === 0 ? (
        <Card
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <RestaurantMenuIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No mess plans available
          </Typography>
          <Typography fontSize={13} color="text.secondary" mt={1}>
            Please check back later or contact the mess admin.
          </Typography>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
            },
            gap: 3,
            mb: 4,
          }}
        >
          {plans.map((plan) => {
            const isCurrentPlan =
              hasActiveAccess &&
              (subscription?.planId?._id === plan._id ||
                subscription?.planId === plan._id);
            return (
              <PlanCard
                key={plan._id}
                plan={plan}
                isActive={selectedPlan?._id === plan._id}
                isCurrent={isCurrentPlan}
                locked={!canPurchaseNewPlan && !isCurrentPlan}
                onSelect={handleSelectPlan}
                loading={paying && selectedPlan?._id === plan._id}
              />
            );
          })}
        </Box>
      )}

      {/* Security note */}
      <Divider sx={{ mb: 3 }} />
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        justifyContent="center"
        flexWrap="wrap"
      >
        <LockIcon sx={{ fontSize: 16, color: "text.disabled" }} />
        <Typography fontSize={12} color="text.secondary">
          Payments are processed securely by{" "}
          <strong style={{ color: "#526cf5" }}>Razorpay</strong>. We do not
          store your card details.
        </Typography>
        <AutorenewIcon sx={{ fontSize: 16, color: "text.disabled" }} />
        <Typography fontSize={12} color="text.secondary">
          Subscription activates immediately after successful payment.
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
