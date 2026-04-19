import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowDownward,
  ArrowUpward,
  Assignment,
  Download,
  Payment,
  People,
  Refresh,
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDateLabel = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusColor = {
  requested: "warning",
  approved: "success",
  rejected: "error",
};

const toCsv = (rows) => {
  const headers = [
    "Student",
    "Email",
    "Plan",
    "Status",
    "Refund Amount",
    "Refund Date",
    "Reason",
  ];

  const escapeValue = (value) => {
    const safe = String(value ?? "");
    if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };

  const dataRows = rows.map((row) => [
    row.studentName,
    row.studentEmail,
    row.plan,
    row.refundStatus,
    Number(row.refundAmount || 0),
    formatDateLabel(row.refundDate),
    row.refundReason || "",
  ]);

  return [headers, ...dataRows]
    .map((row) => row.map(escapeValue).join(","))
    .join("\n");
};

function MessReports() {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const isFirstLoadRef = useRef(true);
  const [filters, setFilters] = useState({
    status: "all",
    planId: "all",
    from: "",
    to: "",
    page: 1,
    limit: 10,
  });

  const fetchReports = useCallback(async () => {
    try {
      setError("");
      if (isFirstLoadRef.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.status !== "all") params.status = filters.status;
      if (filters.planId !== "all") params.planId = filters.planId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await api.get("/mess/reports", { params });
      setReportData(response.data?.data || {});
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to load reports.";
      setError(message);
      setToastOpen(true);
    } finally {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchReports().catch(() => {});
    }, 60000);

    return () => clearInterval(timer);
  }, [fetchReports]);

  const isEmpty = useMemo(
    () => !reportData || Object.keys(reportData).length === 0,
    [reportData],
  );

  const revenueTrendChip = useMemo(() => {
    const trend = reportData?.insights?.revenueTrend;
    const percent = reportData?.insights?.revenueChangePercent || 0;

    if (!trend || percent === 0) {
      return (
        <Chip
          size="small"
          label="No change"
          variant="outlined"
          icon={<TrendingUp fontSize="small" />}
        />
      );
    }

    const isUp = trend === "up";
    return (
      <Chip
        size="small"
        color={isUp ? "success" : "error"}
        label={`${percent}% ${isUp ? "growth" : "drop"} vs last month`}
        icon={
          isUp ? (
            <ArrowUpward fontSize="small" />
          ) : (
            <ArrowDownward fontSize="small" />
          )
        }
      />
    );
  }, [reportData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleExport = async () => {
    const rows = reportData?.refundTable?.exportRows || [];
    if (!rows.length) return;

    try {
      setExporting(true);
      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `mess-refunds-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ minHeight: "100%", display: "grid", placeItems: "center", py: 8 }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading analytics...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchReports}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box sx={{ minHeight: "100%", py: 8, textAlign: "center" }}>
        <Typography variant="h6" mb={1}>
          No report data found
        </Typography>
        <Typography color="text.secondary" mb={3}>
          There is no report data available right now.
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchReports}
          sx={{ textTransform: "none" }}
        >
          Reload Reports
        </Button>
      </Box>
    );
  }

  const pagination = reportData?.refundTable?.pagination || {};
  const refundRows = reportData?.refundTable?.items || [];
  const plans = reportData?.plans || [];

  return (
    <Box sx={{ minHeight: "100%", pb: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Mess Analytics Dashboard
          </Typography>
          <Typography color="text.secondary">
            Subscriptions, revenue, refunds, and operational trends in one view.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchReports}
            disabled={refreshing}
            sx={{ textTransform: "none" }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={
              exporting ||
              (reportData?.refundTable?.exportRows || []).length === 0
            }
            sx={{ textTransform: "none" }}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Total Subs
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {reportData.totalSubscriptions || 0}
              </Typography>
              <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                Active: {reportData.activeSubscriptions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Assignment color="secondary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Plans
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {reportData.totalPlans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Payment color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(reportData.totalRevenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingUp color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Pending Refunds
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {reportData.pendingRefunds || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingDown color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Refunded
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(reportData.totalRefundedAmount || 0)}
              </Typography>
              <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                Count: {reportData.totalRefundCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" fontSize={14}>
                  Net Revenue
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(reportData.netRevenue || 0)}
              </Typography>
              <Box sx={{ mt: 1 }}>{revenueTrendChip}</Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card
            sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)", height: "100%" }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Daily Revenue Trend (30 days)
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={reportData.dailyRevenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#2e7d32"
                      strokeWidth={3}
                      name="Revenue"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card
            sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)", height: "100%" }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Monthly Refund Trend
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={reportData.monthlyRefundTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "amount" ? formatCurrency(value) : value
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#ed6c02"
                      name="Refund Count"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#0288d1"
                      name="Refund Amount"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)", mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Insights
          </Typography>
          <Stack spacing={1.5}>
            {(reportData?.insights?.messages || []).map((message) => (
              <Box
                key={message}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                {message.toLowerCase().includes("decreased") ? (
                  <TrendingDown color="error" fontSize="small" />
                ) : (
                  <TrendingUp color="success" fontSize="small" />
                )}
                <Typography fontSize={14}>{message}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)", mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Refund Records
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(event) =>
                    handleFilterChange("status", event.target.value)
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="requested">Requested</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Plan</InputLabel>
                <Select
                  value={filters.planId}
                  label="Plan"
                  onChange={(event) =>
                    handleFilterChange("planId", event.target.value)
                  }
                >
                  <MenuItem value="all">All Plans</MenuItem>
                  {plans.map((plan) => (
                    <MenuItem key={plan._id} value={plan._id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                label="From"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.from}
                onChange={(event) =>
                  handleFilterChange("from", event.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                label="To"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.to}
                onChange={(event) =>
                  handleFilterChange("to", event.target.value)
                }
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Refund Date</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {refundRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography py={2} color="text.secondary">
                        No refund records found for selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  refundRows.map((row) => (
                    <TableRow key={row.subscriptionId}>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {row.studentName}
                        </Typography>
                        <Typography color="text.secondary" fontSize={12}>
                          {row.studentEmail || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.plan || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.refundStatus}
                          color={statusColor[row.refundStatus] || "default"}
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.refundAmount || 0)}
                      </TableCell>
                      <TableCell>{formatDateLabel(row.refundDate)}</TableCell>
                      <TableCell>{row.refundReason || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing page {pagination.page || 1} of{" "}
              {pagination.totalPages || 1} ({pagination.totalRecords || 0}{" "}
              records)
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                disabled={!pagination.hasPrevPage}
                onClick={() =>
                  handleFilterChange(
                    "page",
                    Math.max(1, (pagination.page || 1) - 1),
                  )
                }
                sx={{ textTransform: "none" }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  handleFilterChange("page", (pagination.page || 1) + 1)
                }
                sx={{ textTransform: "none" }}
              >
                Next
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Recent Activities
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(reportData.recentActivities || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography py={2} color="text.secondary">
                        No recent activities available.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (reportData.recentActivities || []).map((item, index) => (
                    <TableRow key={`${item.type}-${item.date}-${index}`}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.type.replaceAll("_", " ")}
                          sx={{ textTransform: "capitalize" }}
                          color={
                            item.type.includes("refund") ? "warning" : "success"
                          }
                        />
                      </TableCell>
                      <TableCell>{item.message}</TableCell>
                      <TableCell>{formatDateLabel(item.date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setToastOpen(false)}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MessReports;
