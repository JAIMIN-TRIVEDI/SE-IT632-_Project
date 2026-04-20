import { Box, LinearProgress, Typography } from "@mui/material";
import DashboardCard from "../DashboardCard.jsx";

const TYPE_COLORS = {
  double: "#2563eb",
  triple: "#16a34a",
  quad: "#f59e0b",
};

const toAvailabilityRows = (roomAvailability = {}) => {
  const rows = Array.isArray(roomAvailability?.roomTypes)
    ? roomAvailability.roomTypes
    : [];

  return rows.map((item) => ({
    label: item?.label || "Rooms",
    total: Number(item?.total || 0),
    occupied: Number(item?.occupied || 0),
    available: Number(item?.available || 0),
    color: TYPE_COLORS[item?.key] || "#6366f1",
  }));
};

function WardenAvailabilityCard({ roomAvailability }) {
  const availabilityRows = toAvailabilityRows(roomAvailability);

  return (
    <DashboardCard>
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
                {item.occupied}/{item.total} occupied
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.total > 0 ? (item.occupied / item.total) * 100 : 0}
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
    </DashboardCard>
  );
}

export default WardenAvailabilityCard;
