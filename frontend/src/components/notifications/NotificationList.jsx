import { Box, Typography } from "@mui/material";
import NotificationCard from "./NotificationCard";

function NotificationList({ items, onDelete }) {
  if (!items.length) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No notifications found
        </Typography>
        <Typography color="text.secondary">
          Try changing search or send a new notification.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {items.map((item) => (
        <NotificationCard key={item._id} item={item} onDelete={onDelete} />
      ))}
    </Box>
  );
}

export default NotificationList;
