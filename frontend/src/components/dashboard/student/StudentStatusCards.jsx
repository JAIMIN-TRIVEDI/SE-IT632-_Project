import React from "react";
import { Box, Card, Typography, Chip } from "@mui/material";
import {
  KingBed,
  Restaurant,
  CreditCard,
  CheckCircle,
} from "@mui/icons-material";

const iconMap = {
  KingBed: KingBed,
  Restaurant: Restaurant,
  CreditCard: CreditCard,
  CheckCircle: CheckCircle,
};

export default function StudentStatusCards({ dashboardData }) {
  const room = dashboardData?.room;
  const payments = dashboardData?.payments || [];
  const messCurrentStatus = dashboardData?.messCurrentStatus || "none";
  const messSubscription = dashboardData?.messSubscription;
  const openComplaints = dashboardData?.openComplaints ?? 0;
  const hostelPayments = payments.filter(
    (payment) => payment.type === "hostel" || payment.type === "room_request",
  );
  const latestHostelPayment = hostelPayments[0];

  const messStatusMap = {
    active: {
      value: "Active",
      sub: messSubscription?.planId?.name
        ? `${messSubscription.planId.name} plan`
        : "Subscription is active",
      tag: "ACTIVE",
      tagColor: "#16a34a",
      tagBg: "#f0fdf4",
    },
    requested: {
      value: "Refund Requested",
      sub: "Pending mess admin approval",
      tag: "REQUESTED",
      tagColor: "#b45309",
      tagBg: "#fef3c7",
    },
    refunded: {
      value: "Refunded",
      sub: "You can purchase a new plan",
      tag: "REFUNDED",
      tagColor: "#0f766e",
      tagBg: "#ccfbf1",
    },
    expired: {
      value: "Expired",
      sub: "Please renew your mess plan",
      tag: "EXPIRED",
      tagColor: "#6b7280",
      tagBg: "#f3f4f6",
    },
    none: {
      value: "Not Enrolled",
      sub: "No active mess plan",
      tag: "NONE",
      tagColor: "#6b7280",
      tagBg: "#f3f4f6",
    },
  };

  const messStatus = messStatusMap[messCurrentStatus] || messStatusMap.none;

  const cards = [
    {
      label: "Room Number",
      value: room?.roomNumber || "Unassigned",
      sub: room?.hostelName
        ? `${room.hostelName} · ${room.hostelType || ""}`.trim()
        : "No room assigned",
      tag: "LOCATION",
      icon: "KingBed",
      tagColor: "#2563eb",
      tagBg: "#eff6ff",
    },
    {
      label: "Mess Status",
      value: messStatus.value,
      sub: messStatus.sub,
      tag: messStatus.tag,
      icon: "Restaurant",
      tagColor: messStatus.tagColor,
      tagBg: messStatus.tagBg,
    },
    {
      label: "Room Payment Status",
      value: latestHostelPayment
        ? latestHostelPayment.status === "success"
          ? "Paid"
          : "Pending"
        : "No hostel payment",
      sub: latestHostelPayment
        ? `Last hostel payment: ${new Date(latestHostelPayment.createdAt).toLocaleDateString()}`
        : "No hostel payment records found",
      tag: latestHostelPayment
        ? latestHostelPayment.status === "success"
          ? "PAID"
          : "DUE"
        : "NONE",
      icon: "CreditCard",
      tagColor: latestHostelPayment
        ? latestHostelPayment.status === "success"
          ? "#059669"
          : "#b45309"
        : "#6b7280",
      tagBg: latestHostelPayment
        ? latestHostelPayment.status === "success"
          ? "#d1fae5"
          : "#fef3c7"
        : "#f3f4f6",
    },
    {
      label: "Open Complaints",
      value: `${openComplaints}`,
      sub: openComplaints > 0 ? "Needs attention" : "No pending issues",
      tag: openComplaints > 0 ? "OPEN" : "CLEAR",
      icon: "CheckCircle",
      tagColor: openComplaints > 0 ? "#9333ea" : "#16a34a",
      tagBg: openComplaints > 0 ? "#faf5ff" : "#d1fae5",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      {cards.map((card, idx) => {
        const IconComponent = iconMap[card.icon];
        return (
          <Card
            key={idx}
            sx={{
              p: 2.5,
              border: "1px solid",
              borderColor: "divider",
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: 4 },
            }}
          >
            {/* Header with Icon and Tag */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  bgcolor: card.tagBg,
                  borderRadius: 1.5,
                  p: 1.25,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconComponent sx={{ fontSize: 20, color: card.tagColor }} />
              </Box>
              <Chip
                label={card.tag}
                size="small"
                sx={{
                  color: card.tagColor,
                  bgcolor: card.tagBg,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: "22px",
                }}
              />
            </Box>

            {/* Value and Label */}
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                {card.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ mt: 0.5, fontSize: { xs: "1.55rem", sm: "2rem" } }}
              >
                {card.value}
              </Typography>
              {card.sub && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {card.sub}
                </Typography>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
