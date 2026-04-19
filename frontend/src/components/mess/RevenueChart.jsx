import { Box, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function RevenueChart({ data = [], loading = false }) {
  const hasData = data.some((entry) => Number(entry.revenue) > 0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  return (
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(15, 23, 42, 0.88)"
            : "rgba(248, 250, 252, 0.95)",
        p: 2,
        borderRadius: 3,
        height: 260,
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
      <Typography fontWeight={600}>Revenue Overview</Typography>

      <Typography fontSize={12} color="text.secondary" mb={1}>
        Total earnings over the last 30 days
      </Typography>

      <Box sx={{ height: "78%" }}>
        {!loading && !hasData ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(148, 163, 184, 0.14)"
                  : "#eef2ff",
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Typography fontSize={13} color="text.secondary">
              No revenue recorded in the last 30 days.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                strokeOpacity={0.25}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                minTickGap={24}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value}`}
                width={56}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar
                dataKey="revenue"
                radius={[6, 6, 0, 0]}
                fill="#2563eb"
                animationDuration={450}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}

export default RevenueChart;
