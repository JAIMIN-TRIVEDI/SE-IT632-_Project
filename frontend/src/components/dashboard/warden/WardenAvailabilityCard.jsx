import { Box, LinearProgress, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import DashboardCard from "../DashboardCard.jsx";

const toAvailabilityRows = (roomAvailability = {}) => [
  {
    label: "Single Rooms",
    available: Number(roomAvailability?.singleRooms?.available || 0),
    total: Number(roomAvailability?.singleRooms?.total || 0),
    color: "#2563eb",
  },
  {
    label: "Double Rooms",
    available: Number(roomAvailability?.doubleRooms?.available || 0),
    total: Number(roomAvailability?.doubleRooms?.total || 0),
    color: "#16a34a",
  },
];

function WardenAvailabilityCard({ roomAvailability }) {
  const availabilityRows = toAvailabilityRows(roomAvailability);

  return (
    <DashboardCard sx={{ position: "relative" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Availability
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {availabilityRows.map((item) => (
          <Box key={item.label}>
            <Box display="flex" justifyContent="space-between" mb={0.8}>
              <Typography fontSize={13} fontWeight={500} color="text.primary">
                {item.label}
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                {item.available}/{item.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.total > 0 ? (item.available / item.total) * 100 : 0}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "divider",
                "& .MuiLinearProgress-bar": {
                  bgcolor: item.color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          cursor: "default",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 12px rgba(0,0,0,0.5)"
              : "0 4px 12px rgba(37,99,235,0.4)",
          "&:hover": { bgcolor: "primary.main" },
        }}
      >
        <Add />
      </Box>
    </DashboardCard>
  );
}

export default WardenAvailabilityCard;
