import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import api from "../api/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const roomOptions = [
  {
    value: "double",
    label: "Double",
    price: 30000,
    description: "2 occupants, cozy and efficient",
  },
  {
    value: "triple",
    label: "Triple",
    price: 35000,
    description: "3 occupants, balanced price and space",
  },
  {
    value: "quad",
    label: "Quad",
    price: 40000,
    description: "4 occupants, more spacious and economical",
  },
];

function ApplyRoom() {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("triple");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requestRes = await api.get("/room-requests/me");
        setCurrentRequest(requestRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, []);

  const selectedRoomOption = useMemo(
    () => roomOptions.find((option) => option.value === selectedType),
    [selectedType],
  );

  const handleCreateRequest = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const requestResponse = await api.post("/room-requests", {
        roomType: selectedType,
      });

      const requestData = requestResponse.data.data;
      const orderResponse = await api.post("/payments/order", {
        amount: requestData.amount,
        purpose: `Room request payment for ${selectedRoomOption.label}`,
        subscriptionId: requestData._id,
        type: "room_request",
      });

      const keyResponse = await api.get("/payments/key");
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout script.");
      }

      const { order } = orderResponse.data;
      const options = {
        key: keyResponse.data.key,
        amount: order.amount,
        currency: order.currency,
        name: "Hostezy",
        image: "/hostezy_logo.svg",
        description: `Payment for ${selectedRoomOption.label} room request`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate("/student/dashboard");
          } catch (verifyError) {
            setError(
              verifyError.response?.data?.message || verifyError.message,
            );
          }
        },
        theme: {
          color: "#1976d2",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (currentRequest) {
    return (
      <Box sx={{ p: 4 }}>
        <Card sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Room Request Status
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Request status: <strong>{currentRequest.status}</strong>
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Payment status: <strong>{currentRequest.paymentStatus}</strong>
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Requested room type: <strong>{currentRequest.roomType}</strong>
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Amount: <strong>₹{currentRequest.amount}</strong>
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your room request is already in process. You can return to the
            dashboard for updates.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/student/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Apply for a Room
      </Typography>
      <Typography sx={{ mb: 4, color: "text.secondary" }}>
        Select the room type you want, then complete a secure payment to request
        assignment.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <RadioGroup
        value={selectedType}
        onChange={(event) => setSelectedType(event.target.value)}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 4,
          }}
        >
          {roomOptions.map((room) => (
            <Card
              key={room.value}
              sx={{
                p: 3,
                border: selectedType === room.value ? "2px solid" : "1px solid",
                borderColor:
                  selectedType === room.value ? "primary.main" : "divider",
              }}
            >
              <FormControlLabel
                value={room.value}
                control={<Radio />}
                label={room.label}
                sx={{ mb: 2, width: "100%" }}
              />
              <Typography variant="body2" color="text.secondary">
                {room.description}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                ₹{room.price.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                {room.value === "triple"
                  ? "Standard rent"
                  : room.value === "double"
                    ? "Lower rent, more occupants"
                    : "Higher rent, more space"}
              </Typography>
            </Card>
          ))}
        </Box>
      </RadioGroup>
      <Divider sx={{ mb: 4 }} />
      <Button
        variant="contained"
        disabled={submitting}
        onClick={handleCreateRequest}
      >
        {submitting
          ? "Processing payment..."
          : `Request ${selectedRoomOption?.label} Room`}
      </Button>
    </Box>
  );
}

export default ApplyRoom;
