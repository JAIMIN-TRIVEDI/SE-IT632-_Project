import { Box, Typography } from "@mui/material";

function RecentActivity({ items = [], loading = false }) {
  const formatTime = (value) => {
    if (!value) return "Recently";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(15, 23, 42, 0.88)"
            : "rgba(248, 250, 252, 0.95)",
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(148, 163, 184, 0.18)"
            : "rgba(15, 23, 42, 0.08)",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 10px 30px rgba(2, 6, 23, 0.38)"
            : "0 10px 25px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Typography fontWeight={600} mb={2}>
        Recent Activity
      </Typography>

      {loading ? (
        <Typography fontSize={13} color="text.secondary">
          Loading activity...
        </Typography>
      ) : items.length === 0 ? (
        <Typography fontSize={13} color="text.secondary">
          No recent activity available.
        </Typography>
      ) : (
        items.map((activity, index) => (
          <Box key={`${activity.type || "activity"}-${index}`} sx={{ mb: 1.5 }}>
            <Typography fontSize={13}>{activity.message}</Typography>
            <Typography fontSize={11} color="text.secondary">
              {formatTime(activity.createdAt)}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

export default RecentActivity;
