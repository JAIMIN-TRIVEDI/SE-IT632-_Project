import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import RecordsTable from "../components/mess/RecordsTable";
import { useSearch } from "../hooks/useSearch";
import { useStudents } from "../hooks/useStudents";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { usePayments } from "../hooks/usePayments";
import { approveRefund, rejectRefund } from "../services/messService";

const TAB_CONFIG = {
  students: {
    label: "Students",
    searchPlaceholder: "Search by name, email, or enrollment",
    emptyMessage: "No students found for current filters.",
  },
  subscriptions: {
    label: "Subscriptions",
    searchPlaceholder: "Search by student, plan, or status",
    emptyMessage: "No subscriptions found for current filters.",
  },
  payments: {
    label: "Payments",
    searchPlaceholder: "Search by student, transaction id, or status",
    emptyMessage: "No payments found for current filters.",
  },
};

const STUDENT_STATUS_OPTIONS = [
  "all",
  "active",
  "requested",
  "expired",
  "refunded",
];
const SUBSCRIPTION_STATUS_OPTIONS = [
  "all",
  "active",
  "expired",
  "cancelled",
  "refund_pending",
  "refund_approved",
];
const PAYMENT_STATUS_OPTIONS = [
  "all",
  "success",
  "pending",
  "failed",
  "refunded",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getRefundChipConfig = (status) => {
  const normalized = String(status || "none").toLowerCase();

  if (normalized === "requested") {
    return { label: "Requested", color: "warning" };
  }

  if (normalized === "approved" || normalized === "refunded") {
    return { label: "Approved", color: "success" };
  }

  if (normalized === "rejected") {
    return { label: "Rejected", color: "error" };
  }

  return { label: "None", color: "default" };
};

function StatsCard({ label, value }) {
  return (
    <Card sx={{ minWidth: 200, bgcolor: "background.paper" }}>
      <CardContent>
        <Typography fontSize={12} color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function MessRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [actionError, setActionError] = useState("");
  const [approvingId, setApprovingId] = useState("");

  const initialTab = searchParams.get("tab");
  const activeTab = TAB_CONFIG[initialTab] ? initialTab : "students";

  const { search, setSearch, debouncedSearch, isDebouncing } = useSearch(
    "",
    300,
  );

  const studentsHook = useStudents({
    enabled: activeTab === "students",
    search: debouncedSearch,
  });
  const subscriptionsHook = useSubscriptions({
    enabled: activeTab === "subscriptions",
    search: debouncedSearch,
  });
  const paymentsHook = usePayments({
    enabled: activeTab === "payments",
    search: debouncedSearch,
  });

  const activeHook =
    activeTab === "students"
      ? studentsHook
      : activeTab === "subscriptions"
        ? subscriptionsHook
        : paymentsHook;

  const isActiveLoading = activeHook.loading || isDebouncing;

  const studentsColumns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
      },
      {
        key: "email",
        label: "Email",
      },
      {
        key: "enrollmentNo",
        label: "Enrollment",
      },
      {
        key: "phone",
        label: "Phone",
        render: (row) => row.phone || "—",
      },
      {
        key: "currentPlan",
        label: "Plan",
      },
      {
        key: "refundDetails",
        label: "Refund",
        render: (row) => {
          const chip = getRefundChipConfig(row.refundStatus);

          return (
            <Stack direction="column" spacing={0.5}>
              <Chip
                size="small"
                color={chip.color}
                label={chip.label}
                sx={{ width: "fit-content" }}
              />
              {row.isRefunded && (
                <Typography fontSize={12} color="success.main">
                  Refunded {formatCurrency(row.refundAmount)}
                </Typography>
              )}
              {row.refundReason && (
                <Typography fontSize={11} color="text.secondary">
                  {row.refundReason}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <Chip
            size="small"
            label={row.status || "none"}
            color={
              row.status === "active"
                ? "success"
                : row.status === "requested"
                  ? "warning"
                  : row.status === "expired"
                    ? "warning"
                    : row.status === "refunded"
                      ? "success"
                      : "default"
            }
          />
        ),
      },
    ],
    [],
  );

  const subscriptionsColumns = useMemo(
    () => [
      {
        key: "student",
        label: "Student",
        render: (row) => (
          <Box>
            <Typography fontWeight={600}>
              {row.studentId?.name || "Unknown"}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              {row.studentId?.email || "—"}
            </Typography>
          </Box>
        ),
      },
      {
        key: "plan",
        label: "Plan",
        render: (row) => row.planId?.name || "N/A",
      },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <Chip
            size="small"
            label={row.status || "none"}
            color={
              row.status === "active"
                ? "success"
                : row.status === "refund_pending"
                  ? "warning"
                  : row.status === "refund_approved"
                    ? "success"
                    : row.status === "expired"
                      ? "warning"
                      : "default"
            }
          />
        ),
      },
      {
        key: "startDate",
        label: "Start",
        render: (row) =>
          row.startDate ? new Date(row.startDate).toLocaleDateString() : "—",
      },
      {
        key: "endDate",
        label: "End",
        render: (row) =>
          row.endDate ? new Date(row.endDate).toLocaleDateString() : "—",
      },
      {
        key: "refund",
        label: "Refund",
        render: (row) => {
          const chip = getRefundChipConfig(row.refundStatus);
          return (
            <Stack direction="column" spacing={0.5}>
              <Chip
                size="small"
                color={chip.color}
                label={chip.label}
                sx={{ width: "fit-content" }}
              />
              {row.isRefunded && (
                <Typography fontSize={12} color="success.main">
                  Refunded {formatCurrency(row.refundAmount)}
                </Typography>
              )}
              {row.refundAmount > 0 && !row.isRefunded && (
                <Typography fontSize={12} color="text.secondary">
                  {formatCurrency(row.refundAmount)}
                </Typography>
              )}
              {row.refundDate && (
                <Typography fontSize={11} color="text.secondary">
                  {new Date(row.refundDate).toLocaleString("en-IN")}
                </Typography>
              )}
              {row.refundReason && (
                <Typography fontSize={11} color="text.secondary">
                  {row.refundReason}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        key: "action",
        label: "Action",
        align: "right",
        render: (row) =>
          row.refund?.requested && !row.refund?.approved ? (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                size="small"
                disabled={approvingId === row._id}
                onClick={async () => {
                  try {
                    setActionError("");
                    setApprovingId(row._id);
                    await approveRefund(row._id);
                    await Promise.all([
                      subscriptionsHook.refresh(),
                      studentsHook.refresh(),
                      paymentsHook.refresh(),
                    ]);
                  } catch (err) {
                    setActionError(
                      err.response?.data?.message ||
                        err.message ||
                        "Failed to approve refund.",
                    );
                  } finally {
                    setApprovingId("");
                  }
                }}
                sx={{ textTransform: "none" }}
              >
                {approvingId === row._id ? "Approving..." : "Approve"}
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                disabled={approvingId === row._id}
                onClick={async () => {
                  const reason =
                    window.prompt(
                      "Optional: Enter rejection reason (max 300 chars)",
                      "",
                    ) || "";
                  try {
                    setActionError("");
                    setApprovingId(row._id);
                    await rejectRefund(row._id, { reason });
                    await Promise.all([
                      subscriptionsHook.refresh(),
                      studentsHook.refresh(),
                      paymentsHook.refresh(),
                    ]);
                  } catch (err) {
                    setActionError(
                      err.response?.data?.message ||
                        err.message ||
                        "Failed to reject refund.",
                    );
                  } finally {
                    setApprovingId("");
                  }
                }}
                sx={{ textTransform: "none" }}
              >
                {approvingId === row._id ? "Rejecting..." : "Reject"}
              </Button>
            </Stack>
          ) : (
            <Typography fontSize={12} color="text.secondary">
              No action
            </Typography>
          ),
      },
    ],
    [approvingId, subscriptionsHook],
  );

  const paymentsColumns = useMemo(
    () => [
      {
        key: "student",
        label: "Student",
        render: (row) => row.userId?.name || row.userId?.email || "Unknown",
      },
      {
        key: "amount",
        label: "Amount",
        render: (row) => formatCurrency(row.amount),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => {
          const status = String(row.status || "unknown").toLowerCase();
          const chipColor =
            status === "refunded"
              ? "success"
              : status === "success"
                ? "success"
                : status === "pending"
                  ? "warning"
                  : status === "failed"
                    ? "error"
                    : "default";

          return <Chip size="small" color={chipColor} label={status} />;
        },
      },
      {
        key: "refundInfo",
        label: "Refund",
        render: (row) => {
          const chip = getRefundChipConfig(row.refundStatus);
          return (
            <Stack direction="column" spacing={0.5}>
              <Chip
                size="small"
                color={chip.color}
                label={chip.label}
                sx={{ width: "fit-content" }}
              />
              {row.isRefunded && (
                <Typography fontSize={12} color="success.main">
                  Refunded {formatCurrency(row.refundAmount || row.amount)}
                </Typography>
              )}
              {row.refundDate && (
                <Typography fontSize={11} color="text.secondary">
                  {new Date(row.refundDate).toLocaleString("en-IN")}
                </Typography>
              )}
              {row.refundReason && (
                <Typography fontSize={11} color="text.secondary">
                  {row.refundReason}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        key: "purpose",
        label: "Purpose",
        render: (row) => row.purpose || "Mess payment",
      },
      {
        key: "createdAt",
        label: "Date",
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
    ],
    [],
  );

  const activeColumns =
    activeTab === "students"
      ? studentsColumns
      : activeTab === "subscriptions"
        ? subscriptionsColumns
        : paymentsColumns;

  const statsCards =
    activeTab === "students"
      ? [{ label: "Total Students", value: studentsHook.stats.total }]
      : activeTab === "subscriptions"
        ? [
            {
              label: "Total Subscriptions",
              value: subscriptionsHook.stats.total,
            },
            { label: "Active", value: subscriptionsHook.stats.active },
            { label: "Expired", value: subscriptionsHook.stats.expired },
          ]
        : [
            { label: "Total Payments", value: paymentsHook.stats.total },
            {
              label: "Total Revenue",
              value: formatCurrency(paymentsHook.stats.totalRevenue),
            },
          ];

  const activeStatusOptions =
    activeTab === "students"
      ? STUDENT_STATUS_OPTIONS
      : activeTab === "subscriptions"
        ? SUBSCRIPTION_STATUS_OPTIONS
        : PAYMENT_STATUS_OPTIONS;

  const activeSortOptions =
    activeTab === "payments"
      ? [
          { value: "latest", label: "Latest" },
          { value: "amount", label: "Amount (High to Low)" },
          { value: "status", label: "Status" },
        ]
      : [
          { value: "latest", label: "Latest" },
          { value: "status", label: "Status" },
        ];

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            Mess Records
          </Typography>
          <Typography color="text.secondary">
            Unified view for students, subscriptions, and payments.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => activeHook.refresh()}
          disabled={activeHook.loading}
          sx={{ textTransform: "none" }}
        >
          Refresh {TAB_CONFIG[activeTab].label}
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {statsCards.map((card) => (
          <StatsCard key={card.label} label={card.label} value={card.value} />
        ))}
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={TAB_CONFIG[activeTab].searchPlaceholder}
          fullWidth
          size="small"
        />
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, nextTab) => {
          setActionError("");
          setSearchParams({ tab: nextTab });
        }}
        sx={{
          mb: 2,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
          "& .Mui-selected": { color: "primary.main" },
        }}
      >
        <Tab value="students" label="Students" />
        <Tab value="subscriptions" label="Subscriptions" />
        <Tab value="payments" label="Payments" />
      </Tabs>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={activeHook.status}
          onChange={(event) => activeHook.setStatus(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          {activeStatusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option === "all" ? "All Statuses" : option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Sort"
          value={activeHook.sort}
          onChange={(event) => activeHook.setSort(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          {activeSortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {activeTab === "payments" && (
          <>
            <TextField
              type="date"
              size="small"
              label="Start Date"
              value={paymentsHook.startDate}
              onChange={(event) =>
                paymentsHook.setStartDate(event.target.value)
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              type="date"
              size="small"
              label="End Date"
              value={paymentsHook.endDate}
              onChange={(event) => paymentsHook.setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
          </>
        )}
      </Stack>

      {(activeHook.error || actionError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {activeHook.error || actionError}
        </Alert>
      )}

      <RecordsTable
        columns={activeColumns}
        rows={activeHook.items}
        loading={isActiveLoading}
        emptyMessage={TAB_CONFIG[activeTab].emptyMessage}
        page={activeHook.page}
        rowsPerPage={activeHook.pagination.limit || 10}
        totalRecords={activeHook.pagination.totalRecords || 0}
        onPageChange={activeHook.setPage}
      />
    </Box>
  );
}

export default MessRecords;
