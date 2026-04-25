import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Campaign } from "@mui/icons-material";
import DashboardCard from "../DashboardCard.jsx";

const formatRelativeTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function WardenAnnouncementsCard({ items = [] }) {
  return (
    <DashboardCard>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Announcements
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "primary.main",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          New
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {items.map((item, index) => {
          return (
            <Box
              key={`${item.title || "announcement"}-${item.createdAt || index}`}
              display="flex"
              gap={1.5}
              alignItems="flex-start"
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Campaign sx={{ fontSize: 18, color: "primary.main" }} />
              </Box>
              <Box>
                <Typography fontSize={13} fontWeight={700} color="text.primary">
                  {item.title}
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  lineHeight={1.5}
                >
                  {item.message}
                </Typography>
                <Typography fontSize={11} color="text.secondary" mt={0.3}>
                  {formatRelativeTime(item.createdAt)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        {!items.length ? (
          <Typography fontSize={13} color="text.secondary">
            No announcements found.
          </Typography>
        ) : null}
      </Box>
    </DashboardCard>
  );
}

export default WardenAnnouncementsCard;
