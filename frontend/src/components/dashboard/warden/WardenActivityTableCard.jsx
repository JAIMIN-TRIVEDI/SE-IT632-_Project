import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { MoreVert } from "@mui/icons-material";
import DashboardCard from "../DashboardCard.jsx";

const getInitials = (name = "") => {
  const chunks = String(name).trim().split(/\s+/).filter(Boolean);
  if (!chunks.length) return "NA";
  if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
  return `${chunks[0][0] || ""}${chunks[1][0] || ""}`.toUpperCase();
};

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
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

function WardenActivityTableCard({ items = [] }) {
  const [activityFilter, setActivityFilter] = useState("All");

  const filteredActivity = useMemo(() => {
    if (activityFilter === "All") return items;
    if (activityFilter === "In")
      return items.filter((item) => item.status === "CHECK-IN");
    if (activityFilter === "Out")
      return items.filter((item) => item.status === "CHECK-OUT");
    return items;
  }, [activityFilter, items]);

  return (
    <DashboardCard sx={{ flex: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
        gap={1}
        flexWrap="wrap"
      >
        <Typography fontWeight={700} fontSize={16} color="text.primary">
          Recent Activity
        </Typography>
        <ToggleButtonGroup
          value={activityFilter}
          exclusive
          onChange={(event, value) => value && setActivityFilter(value)}
          size="small"
          sx={{
            flexWrap: 'wrap',
            ...{
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.06)
                  : "#f1f5f9",
              borderRadius: 2,
              border: "none",
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                fontSize: 13,
                color: "text.secondary",
                fontWeight: 500,
                textTransform: "none",
                "&.Mui-selected": {
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.12)
                      : theme.palette.common.white,
                  color: "text.primary",
                  fontWeight: 600,
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 1px 2px rgba(0,0,0,0.5)"
                      : "0 1px 3px rgba(0,0,0,0.1)",
                },
              },
            },
          }}
        >
          <ToggleButton value="All">All</ToggleButton>
          <ToggleButton value="In">In</ToggleButton>
          <ToggleButton value="Out">Out</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            {["STUDENT", "ROOM", "STATUS", "TIME", "ACTION"].map((header) => (
              <TableCell
                key={header}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1.5,
                  pt: 0,
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredActivity.map((row, index) => {
            const isCheckIn = row.status === "CHECK-IN";
            const name = row.studentName || row.name || "Student";
            return (
              <TableRow
                key={`${name}-${row.roomNumber || row.room || "NA"}-${row.time || index}`}
                sx={{
                  "&:last-child td": { border: 0 },
                  "&:hover": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.06)
                        : "#f8fafc",
                  },
                }}
              >
                <TableCell sx={{ py: 1.8, border: "none" }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: (theme) =>
                          isCheckIn
                            ? alpha(
                                theme.palette.success.main,
                                theme.palette.mode === "dark" ? 0.24 : 0.14,
                              )
                            : alpha(
                                theme.palette.warning.main,
                                theme.palette.mode === "dark" ? 0.24 : 0.14,
                              ),
                        color: (theme) =>
                          isCheckIn
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(name)}
                    </Avatar>
                    <Typography
                      fontSize={14}
                      fontWeight={500}
                      color="text.primary"
                    >
                      {name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 14,
                    color: "text.secondary",
                    border: "none",
                    py: 1.8,
                  }}
                >
                  {row.roomNumber || row.room || "-"}
                </TableCell>
                <TableCell sx={{ border: "none", py: 1.8 }}>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 1,
                      height: 24,
                      bgcolor: (theme) =>
                        isCheckIn
                          ? alpha(
                              theme.palette.success.main,
                              theme.palette.mode === "dark" ? 0.2 : 0.18,
                            )
                          : alpha(
                              theme.palette.warning.main,
                              theme.palette.mode === "dark" ? 0.2 : 0.16,
                            ),
                      color: (theme) =>
                        isCheckIn
                          ? theme.palette.success.main
                          : theme.palette.warning.main,
                      border: (theme) =>
                        `1px solid ${isCheckIn ? theme.palette.success.main : theme.palette.warning.main}`,
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 14,
                    color: "text.secondary",
                    border: "none",
                    py: 1.8,
                  }}
                >
                  {formatRelativeTime(row.time)}
                </TableCell>
                <TableCell sx={{ border: "none", py: 1.8 }}>
                  <IconButton size="small" sx={{ color: "text.secondary" }}>
                    <MoreVert fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </Box>
      {!filteredActivity.length ? (
        <Box textAlign="center" mt={2}>
          <Typography fontSize={13} color="text.secondary">
            No recent activity found.
          </Typography>
        </Box>
      ) : null}
    </DashboardCard>
  );
}

export default WardenActivityTableCard;
