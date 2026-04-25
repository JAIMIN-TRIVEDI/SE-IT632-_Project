import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

const roomTypeMeta = {
  double: {
    label: "Double",
    description: "2 occupants, cozy and efficient",
  },
  triple: {
    label: "Triple",
    description: "3 occupants, balanced price and space",
  },
  quad: {
    label: "Quad",
    description: "4 occupants, more spacious and economical",
  },
};

const statusLabelMap = {
  pending: "Pending Warden Approval",
  approved: "Approved",
  rejected: "Rejected",
};

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

function ApplyRoom() {
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [requestMode, setRequestMode] = useState("specific");
  const [selectedType, setSelectedType] = useState("triple");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [allowNewRequestAfterRejection, setAllowNewRequestAfterRejection] =
    useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [requestRes, roomsRes, dashboardRes] = await Promise.allSettled([
          api.get("/room-requests/me"),
          api.get("/room-requests/available"),
          api.get("/user/student/dashboard"),
        ]);

        if (requestRes.status === "fulfilled") {
          setCurrentRequest(requestRes.value.data?.data || null);
        }

        if (dashboardRes.status === "fulfilled") {
          setActiveRoom(dashboardRes.value.data?.data?.room || null);
        }

        if (roomsRes.status === "fulfilled") {
          setAvailableRooms(roomsRes.value.data?.data || []);
        } else if (roomsRes.reason?.response?.status !== 403) {
          throw roomsRes.reason;
        }

        const request = requestRes.status === "fulfilled" ? requestRes.value.data?.data || null : null;
        if (request?.status === "rejected") {
          setAllowNewRequestAfterRejection(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
        setRoomsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const refreshMyRequest = async () => {
    const requestRes = await api.get("/room-requests/me");
    setCurrentRequest(requestRes.data?.data || null);
  };

  const refreshAvailableRooms = async () => {
    setRoomsLoading(true);
    try {
      const roomsRes = await api.get("/room-requests/available");
      setAvailableRooms(roomsRes.data?.data || []);
    } finally {
      setRoomsLoading(false);
    }
  };

  const markPaymentFailed = async (orderId, reason) => {
    if (!orderId) return;

    try {
      await api.post("/payments/fail", {
        orderId,
        reason,
      });
    } catch {
      // Best effort: failure state should not block the user flow.
    }
  };

  const roomOptions = useMemo(() => {
    const roomTypeBuckets = availableRooms.reduce((acc, room) => {
      const type = room?.roomType;
      if (!type || !roomTypeMeta[type]) return acc;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(room);
      return acc;
    }, {});

    return Object.entries(roomTypeMeta).map(([value, meta]) => {
      const rooms = roomTypeBuckets[value] || [];
      const prices = rooms
        .map((room) => Number(room.price))
        .filter((price) => Number.isFinite(price) && price > 0);

      return {
        value,
        label: meta.label,
        description: meta.description,
        price: prices.length ? Math.min(...prices) : null,
        availableCount: rooms.length,
      };
    });
  }, [availableRooms]);

  const selectedRoomOption = useMemo(
    () => roomOptions.find((option) => option.value === selectedType),
    [selectedType, roomOptions],
  );

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => room._id === selectedRoomId),
    [availableRooms, selectedRoomId],
  );

  const groupedHostels = useMemo(() => {
    const grouped = availableRooms.reduce((acc, room) => {
      const hostel = room.hostelId;
      const key = hostel?._id || "unknown";
      if (!acc[key]) {
        acc[key] = {
          hostel,
          rooms: [],
        };
      }
      acc[key].rooms.push(room);
      return acc;
    }, {});

    return Object.values(grouped);
  }, [availableRooms]);

  const canCreateNewRequest =
    !activeRoom && (
      !currentRequest ||
      currentRequest.status === "rejected" ||
      currentRequest.paymentStatus === "paid" ||
      allowNewRequestAfterRejection
    );

  const canPayNow =
    currentRequest &&
    currentRequest.status === "approved" &&
    currentRequest.paymentStatus === "pending";

  const hasActiveRoom = Boolean(activeRoom);

  const shouldShowRequestStatusCard =
    Boolean(currentRequest) &&
    !hasActiveRoom &&
    !allowNewRequestAfterRejection &&
    currentRequest.status !== "rejected" &&
    currentRequest.paymentStatus !== "paid";

  const startRazorpayPayment = async (requestData) => {
    const orderResponse = await api.post("/payments/order", {
      amount: requestData.amount,
      purpose: `Room request payment for Room ${requestData.roomId?.roomNumber || ""}`,
      subscriptionId: requestData._id,
      type: "room_request",
    });

    const { order } = orderResponse.data;

    const keyResponse = await api.get("/payments/key");
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      await markPaymentFailed(order.id, "Unable to load Razorpay checkout script");
      throw new Error("Unable to load Razorpay checkout script.");
    }
    const roomLabel = requestData.roomId?.roomNumber
      ? `Room ${requestData.roomId.roomNumber}`
      : `${requestData.roomType} room request`;

    const options = {
      key: keyResponse.data.key,
      amount: order.amount,
      currency: order.currency,
      name: "Hostezy",
      image: "/hostezy_logo.svg",
      description: `Payment for ${roomLabel}`,
      order_id: order.id,
      handler: async (response) => {
        try {
          await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await refreshMyRequest();
          await refreshAvailableRooms();
          navigate("/student/dashboard");
        } catch (verifyError) {
          setError(verifyError.response?.data?.message || verifyError.message);
        } finally {
          setPaying(false);
        }
      },
      modal: {
        ondismiss: () => {
          markPaymentFailed(order.id, "Checkout dismissed by user");
          setPaying(false);
        },
      },
      theme: {
        color: "#1d4ed8",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", async (response) => {
      await markPaymentFailed(
        response?.error?.metadata?.order_id || order.id,
        response?.error?.description || "Payment failed",
      );
    });
    razorpay.open();
  };

  const handlePayForApprovedRequest = async () => {
    if (!currentRequest) return;

    try {
      setPaying(true);
      setError(null);
      await startRazorpayPayment(currentRequest);
    } catch (err) {
      setPaying(false);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleCreateRequest = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (requestMode === "specific" && !selectedRoomId) {
        throw new Error("Select a room before submitting a specific request.");
      }

      const payload =
        requestMode === "specific"
          ? {
              requestMode: "specific",
              roomId: selectedRoomId,
            }
          : {
              requestMode: "random",
              roomType: selectedType,
            };

      const requestResponse = await api.post("/room-requests", payload);
      setCurrentRequest(requestResponse.data?.data || null);
      setAllowNewRequestAfterRejection(false);
      await refreshAvailableRooms();
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

  if (hasActiveRoom) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Room Already Allocated
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Room: <strong>{activeRoom.roomNumber}</strong>
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Type: <strong>{activeRoom.roomType}</strong>
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Hostel: <strong>{activeRoom.hostelName}</strong>
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You already have an active room allocation, so the apply room flow is disabled.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/student/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background:
          "radial-gradient(circle at 0% 0%, rgba(29,78,216,0.12), transparent 38%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.12), transparent 38%)",
        minHeight: "100vh",
      }}
    >
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.7)
              : "linear-gradient(140deg, rgba(219,234,254,0.85) 0%, rgba(255,255,255,0.95) 100%)",
        }}
      >
        <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
          Room Selection Studio
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          Choose a specific room with resident details, or send a random request
          based on room type. Payment is enabled only after warden approval.
        </Typography>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {shouldShowRequestStatusCard && (
        <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Current Room Request
            </Typography>
            <Chip
              label={statusLabelMap[currentRequest.status] || currentRequest.status}
              color={statusColorMap[currentRequest.status] || "default"}
            />
          </Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" fontSize={13}>
                Hostel
              </Typography>
              <Typography fontWeight={700}>
                {currentRequest.hostelId?.name || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" fontSize={13}>
                Room
              </Typography>
              <Typography fontWeight={700}>
                {currentRequest.roomId?.roomNumber
                  ? `Room ${currentRequest.roomId.roomNumber}`
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" fontSize={13}>
                Payment Status
              </Typography>
              <Typography fontWeight={700} sx={{ textTransform: "capitalize" }}>
                {currentRequest.paymentStatus}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" fontSize={13}>
                Amount
              </Typography>
              <Typography fontWeight={700}>
                ₹{Number(currentRequest.amount || 0).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          {currentRequest.status === "pending" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your request is sent to hostel warden. Payment will be enabled only
              after approval.
            </Alert>
          )}

          {canPayNow && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Warden approved your request. Complete payment to confirm room
              allocation.
            </Alert>
          )}

          {currentRequest.status === "rejected" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {currentRequest.rejectionReason
                ? `Request rejected: ${currentRequest.rejectionReason}`
                : "Your request was rejected. You can submit a new one."}
            </Alert>
          )}

          {currentRequest.paymentStatus === "paid" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Payment is completed. If your room is not assigned yet, please wait for the allocation process to finish.
            </Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {canPayNow && (
              <Button
                variant="contained"
                onClick={handlePayForApprovedRequest}
                disabled={paying}
              >
                {paying ? "Opening payment..." : "Pay & Confirm Room"}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => navigate("/student/dashboard")}
            >
              Back to Dashboard
            </Button>
            {currentRequest.status === "rejected" && (
              <Button
                variant="text"
                onClick={() => setAllowNewRequestAfterRejection(true)}
              >
                Submit New Request
              </Button>
            )}
          </Stack>
        </Card>
      )}

      {canCreateNewRequest && (
        <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Tabs
            value={requestMode}
            onChange={(_, value) => setRequestMode(value)}
            sx={{ mb: 2 }}
          >
            <Tab value="specific" label="Choose Specific Room" />
            <Tab value="random" label="Random Room Request" />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

          {requestMode === "specific" ? (
            <Box>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                Available Rooms in Your Eligible Hostels
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Only rooms with free seats are visible. You can preview current
                residents and their academic details.
              </Typography>

              {roomsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : groupedHostels.length === 0 ? (
                <Alert severity="warning">
                  No rooms are currently available for your profile.
                </Alert>
              ) : (
                <Stack spacing={2.5}>
                  {groupedHostels.map((entry) => (
                    <Card
                      key={entry.hostel?._id || "hostel"}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2.5 }}
                    >
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
                        {entry.hostel?.name || "Hostel"}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {entry.hostel?.type
                          ? `${entry.hostel.type} hostel`
                          : "Eligible hostel"}
                      </Typography>

                      <Grid container spacing={2}>
                        {entry.rooms.map((room) => {
                          const isSelected = selectedRoomId === room._id;
                          const blockName = room.blockId?.name || "Block";

                          return (
                            <Grid item xs={12} lg={6} key={room._id}>
                              <Card
                                sx={{
                                  border: "1px solid",
                                  borderColor: isSelected
                                    ? "primary.main"
                                    : "divider",
                                  borderWidth: isSelected ? 2 : 1,
                                  borderRadius: 2,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    boxShadow: (theme) =>
                                      `0 10px 24px ${alpha(
                                        theme.palette.primary.main,
                                        0.14,
                                      )}`,
                                  },
                                }}
                                onClick={() => setSelectedRoomId(room._id)}
                              >
                                <CardContent>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 1,
                                      gap: 1,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Typography fontWeight={800}>
                                      Room {room.roomNumber}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      color="success"
                                      label={`${room.availableSeats} seat${
                                        room.availableSeats === 1 ? "" : "s"
                                      } left`}
                                    />
                                  </Box>

                                  <Typography color="text.secondary" fontSize={13}>
                                    {blockName} • {room.roomType} • Capacity {room.capacity}
                                  </Typography>
                                  <Typography sx={{ mt: 1, fontWeight: 700 }}>
                                    ₹{Number(room.price || 0).toLocaleString()}
                                  </Typography>

                                  <Divider sx={{ my: 1.5 }} />
                                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                                    Current Residents ({room.residents?.length || 0})
                                  </Typography>

                                  {room.residents?.length ? (
                                    <Stack spacing={0.8}>
                                      {room.residents.map((resident) => (
                                        <Box
                                          key={resident._id}
                                          sx={{
                                            p: 1,
                                            borderRadius: 1.5,
                                            bgcolor: (theme) =>
                                              theme.palette.mode === "dark"
                                                ? alpha(theme.palette.common.white, 0.04)
                                                : "#f8fafc",
                                          }}
                                        >
                                          <Typography fontWeight={700} fontSize={13}>
                                            {resident.name}
                                          </Typography>
                                          <Typography color="text.secondary" fontSize={12}>
                                            {resident.course || "Course N/A"}
                                            {resident.studyYear
                                              ? ` • Year ${resident.studyYear}`
                                              : " • Year N/A"}
                                          </Typography>
                                          <Typography color="text.secondary" fontSize={12}>
                                            {resident.enrollmentNo || "Enrollment N/A"}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Stack>
                                  ) : (
                                    <Typography color="text.secondary" fontSize={13}>
                                      No residents yet.
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              )}

              <Box sx={{ mt: 3, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  disabled={!selectedRoomId || submitting}
                  onClick={handleCreateRequest}
                >
                  {submitting
                    ? "Submitting request..."
                    : selectedRoom
                    ? `Request Room ${selectedRoom.roomNumber}`
                    : "Request Selected Room"}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/student/dashboard")}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography fontWeight={700} sx={{ mb: 2 }}>
                Request Any Available Room by Type
              </Typography>

              <RadioGroup
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                <Grid container spacing={2}>
                  {roomOptions.map((room) => (
                    <Grid item xs={12} md={4} key={room.value}>
                      <Card
                        sx={{
                          p: 2,
                          border:
                            selectedType === room.value
                              ? "2px solid"
                              : "1px solid",
                          borderColor:
                            selectedType === room.value
                              ? "primary.main"
                              : "divider",
                          borderRadius: 2.5,
                          opacity: room.availableCount ? 1 : 0.6,
                        }}
                      >
                        <FormControlLabel
                          value={room.value}
                          control={<Radio />}
                          label={room.label}
                          disabled={!room.availableCount}
                          sx={{ mb: 1, width: "100%" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {room.description}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                          {room.price
                            ? `₹${room.price.toLocaleString()}`
                            : "Price not available"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          {room.availableCount
                            ? `${room.availableCount} room${room.availableCount === 1 ? "" : "s"} available`
                            : "No room currently available"}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>

              <Divider sx={{ my: 3 }} />
              <Button
                variant="contained"
                disabled={
                  submitting ||
                  !roomOptions.find((option) => option.value === selectedType)
                    ?.availableCount
                }
                onClick={handleCreateRequest}
              >
                {submitting
                  ? "Submitting request..."
                  : `Request Random ${selectedRoomOption?.label} Room`}
              </Button>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}

export default ApplyRoom;
