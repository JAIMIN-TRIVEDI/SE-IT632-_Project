import MessPlan from "../models/MessPlan.js";
import MessSubscription from "../models/MessSubscription.js";
import MessMenu from "../models/MessMenu.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  expireSubscriptionsAndNotify,
  sendExpiringSubscriptionNotifications,
  sendPaymentSuccessNotification,
} from "../services/notificationService.js";

const getSubscriptionCurrentStatus = (subscription) => {
  if (!subscription) return "none";

  if (subscription.refund?.requested && !subscription.refund?.approved) {
    return "requested";
  }

  if (subscription.status === "cancelled" || subscription.status === "refund_approved") {
    return "refunded";
  }

  if (subscription.status === "expired") {
    return "expired";
  }

  if (subscription.status === "active" && subscription.endDate && new Date(subscription.endDate) < new Date()) {
    return "expired";
  }

  if (subscription.status === "active") {
    return "active";
  }

  return subscription.status;
};

const MENU_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MENU_MEALS = ["breakfast", "lunch", "snacks", "dinner"];

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const markMessPaymentFailed = async ({ orderId, paymentId, reason }) => {
  const payment = await Payment.findOne({
    ...(orderId ? { orderId } : {}),
    ...(paymentId ? { paymentId } : {}),
  });

  if (!payment || payment.status === "success") {
    return payment;
  }

  payment.status = "failed";
  payment.failureReason = reason || "Payment failed";
  payment.failedAt = new Date();
  await payment.save();

  return payment;
};

const toLocalDate = (value) => {
  if (!value) return new Date();

  if (value instanceof Date) return new Date(value);

  if (typeof value === "string") {
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateOnly.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  }

  return new Date(value);
};

const getWeekStartMonday = (inputDate = new Date()) => {
  const date = toLocalDate(inputDate);

  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diffToMonday);

  return date;
};

const createEmptyWeekMenu = () => {
  const base = {};

  MENU_DAYS.forEach((day) => {
    base[day] = {
      breakfast: "",
      lunch: "",
      snacks: "",
      dinner: "",
    };
  });

  return base;
};

const buildMenuUpdatePayload = (menu = {}) => {
  const setObject = {};

  MENU_DAYS.forEach((day) => {
    MENU_MEALS.forEach((meal) => {
      if (menu?.[day]?.[meal] !== undefined) {
        setObject[`menu.${day}.${meal}`] = menu[day][meal] || "";
      }
    });
  });

  return setObject;
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const MAX_REFUND_REASON_LENGTH = 300;

const parseRefundReason = (value = "") => String(value || "").trim();

const calculateRefundAmount = (subscription, plan) => {
  if (!subscription || !plan) return 0;

  const today = new Date();
  const start = new Date(subscription.startDate);
  let usedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
  if (usedDays <= 0) usedDays = 1;

  const totalDays = Math.max(1, Number(plan.durationInDays) || 30);
  const perDay = Number(plan.price || 0) / totalDays;
  return Math.max(0, Math.floor(Number(plan.price || 0) - usedDays * perDay));
};

const findLatestSuccessfulMessPayment = async (studentId) => {
  return Payment.findOne({
    userId: studentId,
    type: "mess",
    status: "success",
    purpose: { $ne: "Mess Refund" },
  }).sort({ createdAt: -1 });
};

const getNormalizedRefundDetails = ({ subscriptionRefund, subscriptionStatus, payment }) => {
  const refund = subscriptionRefund || {};
  const paymentRefund = payment?.refund || {};

  let refundStatus = "none";

  if (refund.status === "requested" || (refund.requested && !refund.approved)) {
    refundStatus = "requested";
  } else if (refund.status === "rejected") {
    refundStatus = "rejected";
  } else if (
    refund.status === "approved"
    || refund.status === "refunded"
    || refund.approved
    || subscriptionStatus === "refund_approved"
  ) {
    refundStatus = "approved";
  }

  const refundAmount = Number(
    refund.amount
    ?? paymentRefund.amount
    ?? 0
  );

  const refundDate =
    refund.processedAt
    || refund.rejectedAt
    || refund.requestedAt
    || paymentRefund.processedAt
    || payment?.refundedAt
    || null;

  const refundReason =
    refund.reason
    || refund.rejectionReason
    || paymentRefund.reason
    || "";

  const isRefunded = Boolean(
    payment?.status === "refunded" || refund.status === "refunded"
  );

  return {
    refundStatus,
    refundAmount,
    refundDate,
    refundReason,
    isRefunded,
  };
};

const isValidDateValue = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const toDateOnlyKey = (value) => {
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toMonthKey = (value) => {
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
};

const getRefundStatusFromSubscription = (subscription = {}) => {
  const refund = subscription.refund || {};

  if (refund.status === "rejected") return "rejected";
  if (refund.status === "approved" || refund.status === "refunded" || refund.approved || subscription.status === "refund_approved") {
    return "approved";
  }
  if (refund.status === "requested" || (refund.requested && !refund.approved)) {
    return "requested";
  }
  return "none";
};

const getRefundDateFromSubscription = (subscription = {}) => {
  const refund = subscription.refund || {};
  return refund.processedAt || refund.rejectedAt || refund.requestedAt || subscription.updatedAt || null;
};

export const getPlans = async (req, res) => {
  const plans = await MessPlan.find();
  res.json({ success: true, data: plans });
};

export const createPlan = async (req, res) => {
  const plan = await MessPlan.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: plan });
};

export const updatePlan = async (req, res) => {
  const plan = await MessPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: plan });
};

export const deletePlan = async (req, res) => {
  await MessPlan.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Plan deleted" });
};

// ── NEW: Create Razorpay order for a mess plan ────────────────────────────────
export const createMessOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "planId is required." });
    }

    const plan = await MessPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Mess plan not found." });
    }

    // Check if student already has an active subscription
    const existing = await MessSubscription.findOne({
      studentId: req.user._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have an active mess subscription.",
      });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
    });

    // Persist a pending Payment record
    const payment = await Payment.create({
      userId: req.user._id,
      type: "mess",
      amount: plan.price,
      orderId: order.id,
      purpose: `Mess plan: ${plan.name}`,
      status: "pending",
      // We store planId in subscriptionId field (repurposed) for later lookup
      subscriptionId: plan._id,
    });

    res.json({ success: true, order, payment, plan });
  } catch (err) {
    console.error("[createMessOrder] ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── NEW: Verify Razorpay payment & activate subscription ─────────────────────
export const verifyMessPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    // Signature verification
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sign !== razorpay_signature) {
      await markMessPaymentFailed({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        reason: "Invalid payment signature",
      });
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    // Mark Payment as success
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    // Fetch plan to calculate dates
    const plan = await MessPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Mess plan not found." });
    }

    payment.status = "success";
    payment.paymentId = razorpay_payment_id;
    payment.failureReason = "";
    payment.failedAt = undefined;
    payment.type = "mess";
    payment.purpose = `Mess plan: ${plan.name}`;
    await payment.save();

    await sendPaymentSuccessNotification({
      userId: payment.userId,
      amount: payment.amount,
      purpose: payment.purpose,
    });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    // Cancel any old expired/cancelled subscriptions first (safety)
    await MessSubscription.updateMany(
      { studentId: req.user._id, status: "active" },
      { status: "expired" }
    );

    // Create the active subscription
    const subscription = await MessSubscription.create({
      studentId: req.user._id,
      planId: plan._id,
      startDate,
      endDate,
      status: "active",
    });

    res.json({
      success: true,
      message: "Payment verified. Mess subscription activated!",
      subscription,
      payment,
    });
  } catch (err) {
    console.error("[verifyMessPayment] ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const subscribePlan = async (req, res) => {
  const { planId, startDate } = req.body;

  await expireSubscriptionsAndNotify();

  const plan = await MessPlan.findById(planId);
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (plan.durationInDays ?? 30));

  const payment = await Payment.create({
    userId: req.user._id,
    type: "mess",
    amount: plan.price,
    purpose: `Mess plan: ${plan.name}`,
    status: "success",
    subscriptionId: plan._id,
  });

  await sendPaymentSuccessNotification({
    userId: req.user._id,
    amount: plan.price,
    purpose: payment.purpose,
  });

  const subscription = await MessSubscription.create({
    studentId: req.user._id,
    planId,
    startDate: start,
    endDate: end,
    status: "active",
  });
  res.status(201).json({ success: true, data: { subscription, payment } });
};

export const getMySubscription = async (req, res) => {
  await expireSubscriptionsAndNotify();

  const subscription = await MessSubscription.findOne({
    studentId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .populate("planId");

  res.json({
    success: true,
    data: subscription,
    currentStatus: getSubscriptionCurrentStatus(subscription),
  });
};

export const getSubscriptions = async (req, res) => {
  await expireSubscriptionsAndNotify();

  const search = (req.query.search || "").trim();
  const status = (req.query.status || "").trim();
  const sort = (req.query.sort || "latest").trim().toLowerCase();
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const skip = (page - 1) * limit;

  const sortStage =
    sort === "status"
      ? { status: 1, createdAt: -1 }
      : { createdAt: -1 };

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "messplans",
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    {
      $unwind: {
        path: "$plan",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "payments",
        let: { sid: "$studentId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$sid"] },
                  { $eq: ["$type", "mess"] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1, createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "latestPayment",
      },
    },
    {
      $unwind: {
        path: "$latestPayment",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const matchConditions = [];

  if (search) {
    const safeSearch = escapeRegex(search);
    matchConditions.push({
      $or: [
        { "student.name": { $regex: safeSearch, $options: "i" } },
        { "plan.name": { $regex: safeSearch, $options: "i" } },
        { status: { $regex: safeSearch, $options: "i" } },
      ],
    });
  }

  if (status) {
    const safeStatus = escapeRegex(status);
    matchConditions.push({
      status: { $regex: `^${safeStatus}$`, $options: "i" },
    });
  }

  if (matchConditions.length) {
    pipeline.push({
      $match: {
        $and: matchConditions,
      },
    });
  }

  pipeline.push(
    {
      $facet: {
        metadata: [{ $count: "totalRecords" }],
        statusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        items: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              studentId: {
                _id: "$student._id",
                name: "$student.name",
                email: "$student.email",
                enrollmentNo: "$student.enrollmentNo",
                phone: "$student.phone",
              },
              planId: {
                _id: "$plan._id",
                name: "$plan.name",
                price: "$plan.price",
                durationInDays: "$plan.durationInDays",
              },
              status: 1,
              startDate: 1,
              endDate: 1,
              refund: {
                requested: "$refund.requested",
                approved: "$refund.approved",
                amount: "$refund.amount",
                status: "$refund.status",
                reason: "$refund.reason",
                transferReference: "$refund.transferReference",
                requestedAt: "$refund.requestedAt",
                processedAt: "$refund.processedAt",
                rejectedAt: "$refund.rejectedAt",
                rejectionReason: "$refund.rejectionReason",
              },
              latestPayment: {
                _id: "$latestPayment._id",
                status: "$latestPayment.status",
                paymentId: "$latestPayment.paymentId",
                orderId: "$latestPayment.orderId",
                refundedAt: "$latestPayment.refundedAt",
                refund: "$latestPayment.refund",
              },
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        items: 1,
        totalRecords: {
          $ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0] }, 0],
        },
        statusBreakdown: 1,
      },
    }
  );

  const [result] = await MessSubscription.aggregate(pipeline);
  const items = (result?.items || []).map((item) => {
    const normalizedRefund = getNormalizedRefundDetails({
      subscriptionRefund: item.refund,
      subscriptionStatus: item.status,
      payment: item.latestPayment,
    });

    return {
      ...item,
      refundStatus: normalizedRefund.refundStatus,
      refundAmount: normalizedRefund.refundAmount,
      refundDate: normalizedRefund.refundDate,
      refundReason: normalizedRefund.refundReason,
      isRefunded: normalizedRefund.isRefunded,
    };
  });
  const totalRecords = result?.totalRecords || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const statusBreakdown = result?.statusBreakdown || [];

  const stats = {
    total: totalRecords,
    active:
      statusBreakdown.find((entry) => String(entry._id || "").toLowerCase() === "active")?.count || 0,
    expired:
      statusBreakdown.find((entry) => String(entry._id || "").toLowerCase() === "expired")?.count || 0,
  };

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats,
  });
};

export const getAllSubscriptionsWithDetails = asyncHandler(async (req, res) => {
  await expireSubscriptionsAndNotify();

  const search = (req.query.search || "").trim();
  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "messplans",
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    {
      $unwind: {
        path: "$plan",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (search) {
    const safeSearch = escapeRegex(search);
    pipeline.push({
      $match: {
        $or: [
          { "student.name": { $regex: safeSearch, $options: "i" } },
          { "plan.name": { $regex: safeSearch, $options: "i" } },
          { status: { $regex: safeSearch, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  const subscriptions = await MessSubscription.aggregate(pipeline);

  const data = subscriptions.map((subscription) => {
    const refundRequested = Boolean(subscription.refund?.requested);
    const refundApproved = Boolean(subscription.refund?.approved);

    let refundState = "not_requested";
    if (refundRequested && !refundApproved) refundState = "pending";
    if (refundRequested && refundApproved) refundState = "approved";

    return {
      _id: subscription._id,
      student: {
        _id: subscription.student?._id || null,
        name: subscription.student?.name || null,
        email: subscription.student?.email || null,
        enrollmentNo: subscription.student?.enrollmentNo || null,
        phone: subscription.student?.phone || null,
      },
      plan: {
        _id: subscription.plan?._id || null,
        name: subscription.plan?.name || null,
        price: subscription.plan?.price || 0,
        durationInDays: subscription.plan?.durationInDays || 0,
      },
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      refundStatus: {
        requested: refundRequested,
        approved: refundApproved,
        amount: subscription.refund?.amount || 0,
        state: refundState,
      },
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  });

  return sendSuccess(res, 200, "Subscriptions fetched successfully", data);
});

export const getStudents = async (req, res) => {
  await expireSubscriptionsAndNotify();

  const search = (req.query.search || "").trim();
  const status = (req.query.status || "").trim();
  const sort = (req.query.sort || "latest").trim().toLowerCase();
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const skip = (page - 1) * limit;
  const now = new Date();

  const pipeline = [
    {
      $match: {
        role: "student",
      },
    },
    {
      $lookup: {
        from: "messsubscriptions",
        let: { studentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$studentId", "$$studentId"],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          { $limit: 1 },
        ],
        as: "latestSubscription",
      },
    },
    {
      $unwind: {
        path: "$latestSubscription",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "messplans",
        localField: "latestSubscription.planId",
        foreignField: "_id",
        as: "latestPlan",
      },
    },
    {
      $unwind: {
        path: "$latestPlan",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        currentStatus: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $eq: ["$latestSubscription.status", "active"] },
                    { $lt: ["$latestSubscription.endDate", now] },
                  ],
                },
                then: "expired",
              },
              {
                case: { $eq: ["$latestSubscription.status", "active"] },
                then: "active",
              },
              {
                case: { $eq: ["$latestSubscription.status", "expired"] },
                then: "expired",
              },
              {
                case: { $eq: ["$latestSubscription.status", "cancelled"] },
                then: "refunded",
              },
              {
                case: { $eq: ["$latestSubscription.status", "refund_approved"] },
                then: "refunded",
              },
              {
                case: {
                  $and: [
                    { $eq: ["$latestSubscription.refund.requested", true] },
                    { $eq: ["$latestSubscription.refund.approved", false] },
                  ],
                },
                then: "requested",
              },
            ],
            default: "refunded",
          },
        },
      },
    },
    {
      $lookup: {
        from: "payments",
        let: { sid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$sid"] },
                  { $eq: ["$type", "mess"] },
                ],
              },
            },
          },
          { $sort: { updatedAt: -1, createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "latestPayment",
      },
    },
    {
      $unwind: {
        path: "$latestPayment",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const matchConditions = [];

  if (search) {
    const safeSearch = escapeRegex(search);
    matchConditions.push({
      $or: [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { enrollmentNo: { $regex: safeSearch, $options: "i" } },
      ],
    });
  }

  if (status) {
    const safeStatus = escapeRegex(status);
    matchConditions.push({
      currentStatus: { $regex: `^${safeStatus}$`, $options: "i" },
    });
  }

  if (matchConditions.length) {
    pipeline.push({
      $match: {
        $and: matchConditions,
      },
    });
  }

  const studentSortStage =
    sort === "status"
      ? { currentStatus: 1, name: 1 }
      : { "latestSubscription.createdAt": -1, name: 1 };

  pipeline.push(
    {
      $facet: {
        metadata: [{ $count: "totalRecords" }],
        statusBreakdown: [
          {
            $group: {
              _id: "$currentStatus",
              count: { $sum: 1 },
            },
          },
        ],
        items: [
          { $sort: studentSortStage },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              enrollmentNo: 1,
              phone: 1,
              currentPlan: { $ifNull: ["$latestPlan.name", "N/A"] },
              status: "$currentStatus",
              latestSubscriptionId: "$latestSubscription._id",
              refund: {
                requested: { $ifNull: ["$latestSubscription.refund.requested", false] },
                approved: { $ifNull: ["$latestSubscription.refund.approved", false] },
                amount: { $ifNull: ["$latestSubscription.refund.amount", 0] },
                reason: { $ifNull: ["$latestSubscription.refund.reason", ""] },
                status: { $ifNull: ["$latestSubscription.refund.status", "not_requested"] },
                requestedAt: "$latestSubscription.refund.requestedAt",
                processedAt: "$latestSubscription.refund.processedAt",
                rejectedAt: "$latestSubscription.refund.rejectedAt",
                rejectionReason: "$latestSubscription.refund.rejectionReason",
              },
              latestPayment: {
                status: "$latestPayment.status",
                refundedAt: "$latestPayment.refundedAt",
                refund: "$latestPayment.refund",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        items: 1,
        totalRecords: {
          $ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0] }, 0],
        },
        statusBreakdown: 1,
      },
    }
  );

  const [result] = await User.aggregate(pipeline);
  const items = (result?.items || []).map((item) => {
    const normalizedRefund = getNormalizedRefundDetails({
      subscriptionRefund: item.refund,
      subscriptionStatus: item.status,
      payment: item.latestPayment,
    });

    return {
      ...item,
      refundStatus: normalizedRefund.refundStatus,
      refundAmount: normalizedRefund.refundAmount,
      refundDate: normalizedRefund.refundDate,
      refundReason: normalizedRefund.refundReason,
      isRefunded: normalizedRefund.isRefunded,
    };
  });
  const totalRecords = result?.totalRecords || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats: {
      total: totalRecords,
    },
  });
};

export const getSubscribedStudents = getStudents;

export const getStudentsWithCurrentPlanStatus = asyncHandler(async (req, res) => {
  await expireSubscriptionsAndNotify();

  const now = new Date();

  const rows = await User.aggregate([
    {
      $match: {
        role: "student",
      },
    },
    {
      $lookup: {
        from: "messsubscriptions",
        let: { studentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$studentId", "$$studentId"],
              },
            },
          },
          {
            $addFields: {
              statusPriority: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $and: [
                          { $eq: ["$status", "active"] },
                          { $gte: ["$endDate", now] },
                        ],
                      },
                      then: 1,
                    },
                    {
                      case: {
                        $and: [
                          { $eq: ["$refund.requested", true] },
                          { $eq: ["$refund.approved", false] },
                        ],
                      },
                      then: 2,
                    },
                    {
                      case: { $eq: ["$status", "refund_approved"] },
                      then: 3,
                    },
                    {
                      case: { $eq: ["$status", "expired"] },
                      then: 4,
                    },
                    {
                      case: { $eq: ["$status", "cancelled"] },
                      then: 5,
                    },
                  ],
                  default: 6,
                },
              },
            },
          },
          {
            $sort: {
              statusPriority: 1,
              endDate: -1,
              createdAt: -1,
            },
          },
          { $limit: 1 },
        ],
        as: "currentSubscription",
      },
    },
    {
      $unwind: {
        path: "$currentSubscription",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "messplans",
        localField: "currentSubscription.planId",
        foreignField: "_id",
        as: "currentPlan",
      },
    },
    {
      $unwind: {
        path: "$currentPlan",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        currentStatus: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    { $eq: ["$currentSubscription.refund.requested", true] },
                    { $eq: ["$currentSubscription.refund.approved", false] },
                  ],
                },
                then: "requested",
              },
              {
                case: {
                  $and: [
                    { $eq: ["$currentSubscription.status", "active"] },
                    { $lt: ["$currentSubscription.endDate", now] },
                  ],
                },
                then: "expired",
              },
              {
                case: { $eq: ["$currentSubscription.status", "refund_approved"] },
                then: "refunded",
              },
              {
                case: { $eq: ["$currentSubscription.status", "cancelled"] },
                then: "refunded",
              },
              {
                case: { $eq: ["$currentSubscription.status", "expired"] },
                then: "expired",
              },
              {
                case: { $eq: ["$currentSubscription.status", "active"] },
                then: "active",
              },
            ],
            default: "none",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        studentId: "$_id",
        name: "$name",
        email: "$email",
        enrollmentNo: "$enrollmentNo",
        phone: "$phone",
        currentPlan: {
          $ifNull: ["$currentPlan.name", "N/A"],
        },
        planPrice: {
          $ifNull: ["$currentPlan.price", 0],
        },
        planDurationInDays: {
          $ifNull: ["$currentPlan.durationInDays", 0],
        },
        status: "$currentStatus",
        startDate: "$currentSubscription.startDate",
        endDate: "$currentSubscription.endDate",
        refundRequested: {
          $ifNull: ["$currentSubscription.refund.requested", false],
        },
        refundApproved: {
          $ifNull: ["$currentSubscription.refund.approved", false],
        },
        refundAmount: {
          $ifNull: ["$currentSubscription.refund.amount", 0],
        },
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);

  return sendSuccess(
    res,
    200,
    "Students with current mess plan fetched successfully",
    rows
  );
});

export const getPayments = async (req, res) => {
  const search = (req.query.search || "").trim();
  const status = (req.query.status || "").trim();
  const sort = (req.query.sort || "latest").trim().toLowerCase();
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const skip = (page - 1) * limit;
  const startDate = (req.query.startDate || "").trim();
  const endDate = (req.query.endDate || "").trim();

  const sortStage =
    sort === "amount"
      ? { amount: -1, createdAt: -1 }
      : sort === "status"
        ? { status: 1, createdAt: -1 }
        : { createdAt: -1 };

  const pipeline = [
    {
      $match: {
        type: "mess",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "messsubscriptions",
        let: { sid: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$studentId", "$$sid"],
              },
            },
          },
          { $sort: { updatedAt: -1, createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "latestSubscription",
      },
    },
    {
      $unwind: {
        path: "$latestSubscription",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const matchConditions = [];

  if (search) {
    const safeSearch = escapeRegex(search);
    matchConditions.push({
      $or: [
        { "student.name": { $regex: safeSearch, $options: "i" } },
        { paymentId: { $regex: safeSearch, $options: "i" } },
        { orderId: { $regex: safeSearch, $options: "i" } },
        { status: { $regex: safeSearch, $options: "i" } },
      ],
    });
  }

  if (status) {
    const safeStatus = escapeRegex(status);
    matchConditions.push({
      status: { $regex: `^${safeStatus}$`, $options: "i" },
    });
  }

  if (startDate || endDate) {
    const createdAtFilter = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) createdAtFilter.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        createdAtFilter.$lte = end;
      }
    }
    if (Object.keys(createdAtFilter).length) {
      matchConditions.push({ createdAt: createdAtFilter });
    }
  }

  if (matchConditions.length) {
    pipeline.push({
      $match: {
        $and: matchConditions,
      },
    });
  }

  pipeline.push(
    {
      $facet: {
        metadata: [{ $count: "totalRecords" }],
        revenue: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
            },
          },
        ],
        statusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        items: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              amount: 1,
              status: 1,
              purpose: 1,
              createdAt: 1,
              paymentId: 1,
              orderId: 1,
              refundedAt: 1,
              refund: 1,
              latestSubscription: {
                status: "$latestSubscription.status",
                refund: "$latestSubscription.refund",
              },
              userId: {
                _id: "$student._id",
                name: "$student.name",
                email: "$student.email",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        items: 1,
        totalRecords: {
          $ifNull: [{ $arrayElemAt: ["$metadata.totalRecords", 0] }, 0],
        },
        totalRevenue: {
          $ifNull: [{ $arrayElemAt: ["$revenue.totalRevenue", 0] }, 0],
        },
        statusBreakdown: 1,
      },
    }
  );

  const [result] = await Payment.aggregate(pipeline);
  const items = (result?.items || []).map((item) => {
    const normalizedRefund = getNormalizedRefundDetails({
      subscriptionRefund: item.latestSubscription?.refund,
      subscriptionStatus: item.latestSubscription?.status,
      payment: {
        status: item.status,
        refundedAt: item.refundedAt,
        refund: item.refund,
      },
    });

    return {
      ...item,
      refundStatus: normalizedRefund.refundStatus,
      refundAmount: normalizedRefund.refundAmount,
      refundDate: normalizedRefund.refundDate,
      refundReason: normalizedRefund.refundReason,
      isRefunded: normalizedRefund.isRefunded,
    };
  });
  const totalRecords = result?.totalRecords || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const totalRevenue = result?.totalRevenue || 0;

  res.json({
    success: true,
    data: items,
    totalRevenue,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats: {
      total: totalRecords,
      totalRevenue,
    },
  });
};

export const getAllMessPayments = asyncHandler(async (req, res) => {
  const search = (req.query.search || "").trim();
  const filter = { type: "mess" };

  if (search) {
    const safeSearch = escapeRegex(search);
    const matchingUsers = await User.find({
      name: { $regex: safeSearch, $options: "i" },
    }).select("_id");

    filter.$or = [
      { userId: { $in: matchingUsers.map((user) => user._id) } },
      { paymentId: { $regex: safeSearch, $options: "i" } },
      { orderId: { $regex: safeSearch, $options: "i" } },
      { status: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .populate("userId", "name")
    .lean();

  const formatted = payments.map((payment) => {
    const normalizedStatus = payment.status === "refunded" ? "refunded" : payment.status;

    return {
      paymentId: payment._id,
      studentName: payment.userId?.name || "Unknown Student",
      amount: payment.amount,
      status: normalizedStatus,
      purpose: payment.purpose || "Mess Payment",
      date: payment.createdAt,
      razorpay: {
        orderId: payment.orderId || null,
        paymentId: payment.paymentId || null,
        currency: "INR",
        gateway: "razorpay",
      },
    };
  });

  return sendSuccess(res, 200, "Mess payments fetched successfully", {
    payments: formatted,
    totalCount: formatted.length,
  });
});

export const getStudentsByPlan = async (req, res) => {
  const { planId } = req.params;
  const subscriptions = await MessSubscription.find({ planId })
    .populate("studentId", "name email enrollmentNo phone")
    .sort({ createdAt: -1 });

  const students = subscriptions.map(sub => ({
    _id: sub.studentId._id,
    name: sub.studentId.name,
    email: sub.studentId.email,
    enrollmentNo: sub.studentId.enrollmentNo,
    phone: sub.studentId.phone,
    status: sub.status,
    startDate: sub.startDate,
    endDate: sub.endDate,
  }));

  res.json({ success: true, data: students });
};

export const getPaymentsByPlan = async (req, res) => {
  const { planId } = req.params;
  const payments = await Payment.find({ type: "mess", subscriptionId: planId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  res.json({ success: true, data: payments, totalRevenue });
};

export const getMessAdminDashboardStats = asyncHandler(async (req, res) => {
  await expireSubscriptionsAndNotify();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const thirtyDaysStart = new Date(now);
  thirtyDaysStart.setHours(0, 0, 0, 0);
  thirtyDaysStart.setDate(thirtyDaysStart.getDate() - 29);

  const [subscriptionsAgg, paymentsAgg, totalPlans] = await Promise.all([
    MessSubscription.aggregate([
      {
        $facet: {
          totalSubscriptions: [{ $count: "count" }],
          pendingRefunds: [
            {
              $match: {
                "refund.requested": true,
                "refund.approved": false,
              },
            },
            { $count: "count" },
          ],
          recentSubscriptions: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "studentId",
                foreignField: "_id",
                as: "student",
              },
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                type: { $literal: "subscription" },
                createdAt: "$createdAt",
                studentName: { $ifNull: ["$student.name", "Student"] },
              },
            },
          ],
          recentExpiredSubscriptions: [
            { $match: { status: "expired" } },
            { $sort: { endDate: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "studentId",
                foreignField: "_id",
                as: "student",
              },
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                type: { $literal: "expired" },
                createdAt: "$endDate",
                studentName: { $ifNull: ["$student.name", "Student"] },
              },
            },
          ],
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
        },
      },
      {
        $facet: {
          totalRevenue: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          monthlyRevenue: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
                createdAt: {
                  $gte: monthStart,
                  $lt: nextMonthStart,
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          last30DaysRevenue: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
                createdAt: { $gte: thirtyDaysStart },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                revenue: { $sum: "$amount" },
              },
            },
            { $sort: { _id: 1 } },
          ],
          recentPayments: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                type: { $literal: "payment" },
                createdAt: "$createdAt",
                amount: { $ifNull: ["$amount", 0] },
                studentName: { $ifNull: ["$user.name", "Student"] },
              },
            },
          ],
          recentRefunds: [
            {
              $match: {
                status: "refunded",
              },
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                type: { $literal: "refund" },
                createdAt: "$updatedAt",
                amount: { $ifNull: ["$amount", 0] },
                studentName: { $ifNull: ["$user.name", "Student"] },
              },
            },
          ],
        },
      },
    ]),
    MessPlan.countDocuments(),
  ]);

  const subscriptionFacet = subscriptionsAgg[0] || {};
  const paymentFacet = paymentsAgg[0] || {};

  const totalSubscriptions = subscriptionFacet.totalSubscriptions?.[0]?.count || 0;
  const pendingRefunds = subscriptionFacet.pendingRefunds?.[0]?.count || 0;
  const totalRevenue = paymentFacet.totalRevenue?.[0]?.total || 0;
  const monthlyRevenue = paymentFacet.monthlyRevenue?.[0]?.total || 0;

  const revenueByDay = new Map(
    (paymentFacet.last30DaysRevenue || []).map((item) => [item._id, item.revenue])
  );

  const revenueSeries = [];
  for (let offset = 0; offset < 30; offset += 1) {
    const date = new Date(thirtyDaysStart);
    date.setDate(thirtyDaysStart.getDate() + offset);

    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    revenueSeries.push({
      date: key,
      label,
      revenue: revenueByDay.get(key) || 0,
    });
  }

  const buildActivityMessage = (activity) => {
    if (activity.type === "payment") {
      return `Payment received ₹${activity.amount} - ${activity.studentName}`;
    }

    if (activity.type === "refund") {
      return `Refund processed ₹${activity.amount} - ${activity.studentName}`;
    }

    if (activity.type === "expired") {
      return `Subscription expired - ${activity.studentName}`;
    }

    return `New subscription - ${activity.studentName}`;
  };

  const recentActivities = [
    ...(paymentFacet.recentPayments || []),
    ...(paymentFacet.recentRefunds || []),
    ...(subscriptionFacet.recentSubscriptions || []),
    ...(subscriptionFacet.recentExpiredSubscriptions || []),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((activity) => ({
      ...activity,
      message: buildActivityMessage(activity),
    }));

  const dashboardStats = {
    totalSubscriptions,
    totalPlans,
    monthlyRevenue,
    totalRevenue,
    pendingRefunds,
    recentActivities,
    revenueSeries,
  };

  return sendSuccess(
    res,
    200,
    "Mess admin dashboard fetched successfully",
    dashboardStats
  );
});

export const getMessReports = asyncHandler(async (req, res) => {
  await expireSubscriptionsAndNotify();

  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thirtyDaysStart = new Date(now);
  thirtyDaysStart.setHours(0, 0, 0, 0);
  thirtyDaysStart.setDate(thirtyDaysStart.getDate() - 29);

  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const skip = (page - 1) * limit;
  const statusFilter = (req.query.status || "all").trim().toLowerCase();
  const planId = (req.query.planId || "").trim();
  const dateFrom = (req.query.from || "").trim();
  const dateTo = (req.query.to || "").trim();

  let filterStart = null;
  let filterEnd = null;

  if (dateFrom && isValidDateValue(dateFrom)) {
    filterStart = new Date(dateFrom);
    filterStart.setHours(0, 0, 0, 0);
  }

  if (dateTo && isValidDateValue(dateTo)) {
    filterEnd = new Date(dateTo);
    filterEnd.setHours(23, 59, 59, 999);
  }

  const [
    totalSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    plans,
    paymentFacets,
    refundSubscriptions,
    pendingRefunds,
    popularPlanAgg,
    recentPayments,
    recentSubscriptions,
  ] = await Promise.all([
    MessSubscription.countDocuments(),
    MessSubscription.countDocuments({
      status: "active",
      endDate: { $gte: now },
    }),
    MessSubscription.countDocuments({
      $or: [
        { status: "expired" },
        { status: "refund_approved" },
        { status: "cancelled" },
      ],
    }),
    MessPlan.find({}, { _id: 1, name: 1, price: 1 }).sort({ createdAt: -1 }).lean(),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
        },
      },
      {
        $facet: {
          totalRevenue: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],
          monthlyRevenue: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
                createdAt: { $gte: startOfCurrentMonth },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$amount" },
              },
            },
          ],
          previousMonthlyRevenue: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
                createdAt: {
                  $gte: startOfPreviousMonth,
                  $lt: endOfPreviousMonth,
                },
              },
            },
            {
              $group: {
                _id: null,
                amount: { $sum: "$amount" },
              },
            },
          ],
          dailyRevenueTrend: [
            {
              $match: {
                status: "success",
                purpose: { $ne: "Mess Refund" },
                createdAt: { $gte: thirtyDaysStart },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                amount: { $sum: "$amount" },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),
    MessSubscription.find({}, {
      _id: 1,
      studentId: 1,
      planId: 1,
      status: 1,
      refund: 1,
      updatedAt: 1,
    })
      .populate("studentId", "name email")
      .populate("planId", "name")
      .lean(),
    MessSubscription.countDocuments({
      "refund.requested": true,
      "refund.approved": false,
    }),
    MessSubscription.aggregate([
      {
        $group: {
          _id: "$planId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "messplans",
          localField: "_id",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          planId: "$_id",
          planName: "$plan.name",
          count: 1,
        },
      },
    ]),
    Payment.find({
      type: "mess",
      status: "success",
      purpose: { $ne: "Mess Refund" },
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    MessSubscription.find({})
      .populate("studentId", "name")
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(8)
      .lean(),
  ]);

  const paymentFacet = paymentFacets[0] || {};
  const totalRevenue = paymentFacet.totalRevenue?.[0]?.amount || 0;
  const totalSuccessfulTransactions = paymentFacet.totalRevenue?.[0]?.count || 0;
  const monthlyRevenue = paymentFacet.monthlyRevenue?.[0]?.amount || 0;
  const previousMonthlyRevenue = paymentFacet.previousMonthlyRevenue?.[0]?.amount || 0;

  const revenueByDayMap = new Map(
    (paymentFacet.dailyRevenueTrend || []).map((entry) => [entry._id, entry.amount])
  );

  const dailyRevenueTrend = [];
  for (let i = 0; i < 30; i += 1) {
    const date = new Date(thirtyDaysStart);
    date.setDate(thirtyDaysStart.getDate() + i);
    const key = toDateOnlyKey(date);
    dailyRevenueTrend.push({
      date: key,
      amount: revenueByDayMap.get(key) || 0,
    });
  }

  const allRefundRows = refundSubscriptions
    .map((subscription) => {
      const refundStatus = getRefundStatusFromSubscription(subscription);
      const refundAmount = Number(subscription?.refund?.amount || 0);
      const refundDate = getRefundDateFromSubscription(subscription);
      const refundReason =
        subscription?.refund?.reason
        || subscription?.refund?.rejectionReason
        || "";

      return {
        subscriptionId: subscription._id,
        studentName: subscription.studentId?.name || "Unknown",
        studentEmail: subscription.studentId?.email || "",
        planId: subscription.planId?._id || null,
        plan: subscription.planId?.name || "N/A",
        refundStatus,
        refundAmount,
        refundDate,
        refundReason,
      };
    })
    .filter((row) => row.refundStatus !== "none");

  const approvedRefundRows = allRefundRows.filter((row) => row.refundStatus === "approved");
  const totalRefundedAmount = approvedRefundRows.reduce((sum, row) => sum + row.refundAmount, 0);
  const totalRefundCount = approvedRefundRows.length;
  const netRevenue = totalRevenue - totalRefundedAmount;

  const monthlyRefundTrendMap = new Map();
  approvedRefundRows.forEach((row) => {
    if (!row.refundDate) return;
    const date = new Date(row.refundDate);
    if (Number.isNaN(date.getTime())) return;
    if (date < sixMonthsStart) return;

    const monthKey = toMonthKey(date);
    const previous = monthlyRefundTrendMap.get(monthKey) || { month: monthKey, count: 0, amount: 0 };
    previous.count += 1;
    previous.amount += row.refundAmount;
    monthlyRefundTrendMap.set(monthKey, previous);
  });

  const monthlyRefundTrend = Array.from(monthlyRefundTrendMap.values()).sort((a, b) =>
    new Date(`${a.month}-01`) - new Date(`${b.month}-01`)
  );

  let filteredRefundRows = [...allRefundRows];

  if (statusFilter && statusFilter !== "all") {
    filteredRefundRows = filteredRefundRows.filter((row) => row.refundStatus === statusFilter);
  }

  if (planId && mongoose.Types.ObjectId.isValid(planId)) {
    filteredRefundRows = filteredRefundRows.filter(
      (row) => String(row.planId || "") === String(planId)
    );
  }

  if (filterStart || filterEnd) {
    filteredRefundRows = filteredRefundRows.filter((row) => {
      if (!row.refundDate) return false;
      const date = new Date(row.refundDate);
      if (Number.isNaN(date.getTime())) return false;
      if (filterStart && date < filterStart) return false;
      if (filterEnd && date > filterEnd) return false;
      return true;
    });
  }

  filteredRefundRows.sort((a, b) => new Date(b.refundDate || 0) - new Date(a.refundDate || 0));

  const refundTotalRecords = filteredRefundRows.length;
  const refundTotalPages = Math.max(1, Math.ceil(refundTotalRecords / limit));
  const pagedRefundRows = filteredRefundRows.slice(skip, skip + limit);

  const revenueChangePercent = previousMonthlyRevenue === 0
    ? (monthlyRevenue > 0 ? 100 : 0)
    : ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100;

  const refundRatePercent = totalSuccessfulTransactions === 0
    ? 0
    : (totalRefundCount / totalSuccessfulTransactions) * 100;

  const mostPopularPlan = popularPlanAgg[0] || {
    planId: null,
    planName: "N/A",
    count: 0,
  };

  const recentActivities = [
    ...recentPayments.map((payment) => ({
      type: "payment",
      date: payment.createdAt,
      message: `Payment received ₹${payment.amount} - ${payment.userId?.name || "Student"}`,
    })),
    ...recentSubscriptions
      .filter((subscription) => getRefundStatusFromSubscription(subscription) !== "none")
      .map((subscription) => {
        const status = getRefundStatusFromSubscription(subscription);
        const amount = subscription?.refund?.amount || 0;
        const studentName = subscription.studentId?.name || "Student";
        const eventDate = getRefundDateFromSubscription(subscription);

        if (status === "requested") {
          return {
            type: "refund_requested",
            date: eventDate,
            message: `Refund requested ₹${amount} - ${studentName}`,
          };
        }

        if (status === "rejected") {
          return {
            type: "refund_rejected",
            date: eventDate,
            message: `Refund rejected - ${studentName}`,
          };
        }

        return {
          type: "refund_approved",
          date: eventDate,
          message: `Refund approved ₹${amount} - ${studentName}`,
        };
      }),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const insights = {
    revenueChangePercent: Number(Math.abs(revenueChangePercent).toFixed(1)),
    revenueTrend: revenueChangePercent >= 0 ? "up" : "down",
    refundRatePercent: Number(refundRatePercent.toFixed(1)),
    mostPopularPlan,
    messages: [
      `Revenue ${revenueChangePercent >= 0 ? "increased" : "decreased"} by ${Math.abs(revenueChangePercent).toFixed(1)}% this month`,
      `Refund rate: ${refundRatePercent.toFixed(1)}% of total successful transactions`,
      `Most popular plan: ${mostPopularPlan.planName || "N/A"}`,
    ],
  };

  return sendSuccess(res, 200, "Mess reports fetched successfully", {
    totalSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    totalPlans: plans.length,
    plans,
    totalRevenue,
    monthlyRevenue,
    dailyRevenueTrend,
    totalRefundedAmount,
    totalRefundCount,
    pendingRefunds,
    monthlyRefundTrend,
    netRevenue,
    recentActivities,
    insights,
    refundTable: {
      items: pagedRefundRows,
      exportRows: filteredRefundRows,
      pagination: {
        page,
        limit,
        totalRecords: refundTotalRecords,
        totalPages: refundTotalPages,
        hasNextPage: page < refundTotalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        status: statusFilter,
        planId,
        from: dateFrom,
        to: dateTo,
      },
    },
  });
});

export const requestRefund = async (req, res) => {
  try {
    const reason = parseRefundReason(req.body?.reason);
    if (reason.length > MAX_REFUND_REASON_LENGTH) {
      return res.status(400).json({ message: "Refund reason cannot exceed 300 characters." });
    }

    const subscription = await MessSubscription.findOne({
      studentId: req.user._id,
      status: { $in: ["active", "refund_pending"] },
    }).populate("planId");

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    if (subscription.refund?.requested && !subscription.refund?.approved) {
      return res.status(409).json({ message: "Refund is already requested for this subscription." });
    }

    const refundAmount = calculateRefundAmount(subscription, subscription.planId);
    const requestedAt = new Date();

    subscription.status = "refund_pending";
    subscription.refund = {
      requested: true,
      approved: false,
      amount: refundAmount,
    };

    await subscription.save();

    await MessSubscription.collection.updateOne(
      { _id: subscription._id },
      {
        $set: {
          "refund.status": "requested",
          "refund.reason": reason,
          "refund.requestedAt": requestedAt,
          "refund.processedAt": null,
          "refund.rejectedAt": null,
          "refund.rejectionReason": "",
          updatedAt: requestedAt,
        },
      }
    );

    const updatedSubscription = await MessSubscription.findById(subscription._id).populate("planId");

    return sendSuccess(res, 200, "Refund request submitted successfully", {
      subscription: updatedSubscription,
      refund: {
        status: "requested",
        amount: refundAmount,
        reason,
        requestedAt,
      },
      currentStatus: getSubscriptionCurrentStatus(updatedSubscription),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const cancelSubscription = requestRefund;

export const getMenu = asyncHandler(async (req, res) => {
  const dateQuery = req.query.date;
  const weekStart = getWeekStartMonday(dateQuery || new Date());

  const menu = await MessMenu.findOne({ weekStart }).lean();
  const payload = menu || {
    weekStart,
    menu: createEmptyWeekMenu(),
  };

  return sendSuccess(res, 200, "Menu fetched successfully", payload);
});

export const updateMenu = asyncHandler(async (req, res) => {
  const dateInput = req.body.weekStart || req.body.date || new Date();
  const weekStart = getWeekStartMonday(dateInput);
  const menu = req.body.menu || {};

  const menuUpdates = buildMenuUpdatePayload(menu);

  const updateOperation = {
    $setOnInsert: {
      weekStart,
    },
  };

  if (Object.keys(menuUpdates).length > 0) {
    updateOperation.$set = menuUpdates;
  }

  // Use native collection update for strict control while preserving existing day/meal entries.
  await MessMenu.collection.updateOne(
    { weekStart },
    updateOperation,
    { upsert: true }
  );

  const updatedMenu = await MessMenu.findOne({ weekStart }).lean();

  return sendSuccess(res, 200, "Menu saved successfully", updatedMenu);
});

export const renewSubscription = async (req, res) => {
  try {
    const subscription = await MessSubscription.findOne({ studentId: req.user._id });
    const plan = await MessPlan.findById(subscription.planId);
    const newEnd = new Date(subscription.endDate);
    if (plan.duration === "weekly") {
      newEnd.setDate(newEnd.getDate() + 7);
    } else {
      newEnd.setDate(newEnd.getDate() + 30);
    }
    subscription.endDate = newEnd;
    await subscription.save();
    res.json({ success: true, data: subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveRefund = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid subscription id." });
    }

    const reason = parseRefundReason(req.body?.reason);
    const transferReference = parseRefundReason(req.body?.transferReference);
    if (reason.length > MAX_REFUND_REASON_LENGTH) {
      return res.status(400).json({ message: "Refund reason cannot exceed 300 characters." });
    }

    if (!transferReference) {
      return res.status(400).json({ message: "Transfer transaction reference is required before approving refund." });
    }

    const subscription = await MessSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    if (!subscription.refund?.requested || subscription.refund?.approved) {
      return res.status(409).json({ message: "Refund is already processed or not requested." });
    }

    if (req.body?.confirmTransfer !== true) {
      return res.status(400).json({
        message: "Please confirm that the transfer to the student's original payment ID/account has been completed before approving.",
      });
    }

    let approvedAmount = Number(subscription.refund?.amount || 0);
    if (req.body?.amount !== undefined) {
      const parsedAmount = Number(req.body.amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ message: "Refund amount must be a positive number." });
      }
      approvedAmount = parsedAmount;
    }

    const processedAt = new Date();

    subscription.status = "refund_approved";
    subscription.refund.approved = true;
    subscription.refund.amount = approvedAmount;
    subscription.endDate = processedAt;

    await subscription.save();

    const paymentToRefund = await findLatestSuccessfulMessPayment(subscription.studentId);

    if (paymentToRefund) {
      await Payment.collection.updateOne(
        { _id: paymentToRefund._id },
        {
          $set: {
            status: "refunded",
            refundedAt: processedAt,
            "refund.status": "refunded",
            "refund.amount": approvedAmount,
            "refund.reason": reason,
            "refund.transferReference": transferReference,
            "refund.processedAt": processedAt,
            "refund.subscriptionId": subscription._id,
            updatedAt: processedAt,
          },
        }
      );
    }

    await MessSubscription.collection.updateOne(
      { _id: subscription._id },
      {
        $set: {
          "refund.status": "refunded",
          "refund.reason": reason,
          "refund.transferReference": transferReference,
          "refund.processedAt": processedAt,
          "refund.rejectedAt": null,
          "refund.rejectionReason": "",
          updatedAt: processedAt,
        },
      }
    );

    return sendSuccess(res, 200, "Refund approved successfully", {
      subscriptionId: subscription._id,
      paymentId: paymentToRefund?._id || null,
      paymentStatus: paymentToRefund ? "refunded" : "not_found",
      transferDetails: {
        amount: approvedAmount,
        paidFromId: paymentToRefund?.paymentId || paymentToRefund?.orderId || null,
        paymentReference: paymentToRefund?.paymentId || paymentToRefund?.orderId || String(paymentToRefund?._id || ""),
        transferReference,
      },
      refund: {
        status: "refunded",
        amount: approvedAmount,
        reason,
        processedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rejectRefund = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid subscription id." });
    }

    const rejectionReason = parseRefundReason(req.body?.reason);
    if (rejectionReason.length > MAX_REFUND_REASON_LENGTH) {
      return res.status(400).json({ message: "Refund reason cannot exceed 300 characters." });
    }

    const subscription = await MessSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    if (!subscription.refund?.requested || subscription.refund?.approved) {
      return res.status(409).json({ message: "Refund is already processed or not requested." });
    }

    const processedAt = new Date();
    subscription.status = "active";
    subscription.refund.requested = false;
    subscription.refund.approved = false;
    await subscription.save();

    await MessSubscription.collection.updateOne(
      { _id: subscription._id },
      {
        $set: {
          "refund.status": "rejected",
          "refund.rejectionReason": rejectionReason,
          "refund.rejectedAt": processedAt,
          "refund.processedAt": processedAt,
          "refund.requested": false,
          "refund.approved": false,
          updatedAt: processedAt,
        },
      }
    );

    return sendSuccess(res, 200, "Refund request rejected successfully", {
      subscriptionId: subscription._id,
      refund: {
        status: "rejected",
        reason: rejectionReason,
        processedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingRefundRequests = asyncHandler(async (req, res) => {
  const rows = await MessSubscription.aggregate([
    {
      $match: {
        "refund.requested": true,
        "refund.approved": false,
      },
    },
    { $sort: { updatedAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "messplans",
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "payments",
        let: { sid: "$studentId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$sid"] },
                  { $eq: ["$type", "mess"] },
                  { $eq: ["$status", "success"] },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "latestPayment",
      },
    },
    { $unwind: { path: "$latestPayment", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        studentId: {
          _id: "$student._id",
          name: "$student.name",
          email: "$student.email",
          enrollmentNo: "$student.enrollmentNo",
        },
        planId: {
          _id: "$plan._id",
          name: "$plan.name",
        },
        status: 1,
        startDate: 1,
        endDate: 1,
        refund: {
          requested: { $ifNull: ["$refund.requested", false] },
          approved: { $ifNull: ["$refund.approved", false] },
          amount: { $ifNull: ["$refund.amount", 0] },
          reason: { $ifNull: ["$refund.reason", ""] },
          transferReference: { $ifNull: ["$refund.transferReference", ""] },
          status: { $ifNull: ["$refund.status", "requested"] },
          requestedAt: { $ifNull: ["$refund.requestedAt", "$updatedAt"] },
          processedAt: "$refund.processedAt",
        },
        latestPayment: {
          _id: "$latestPayment._id",
          paymentId: "$latestPayment.paymentId",
          orderId: "$latestPayment.orderId",
          status: "$latestPayment.status",
          createdAt: "$latestPayment.createdAt",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return sendSuccess(res, 200, "Pending refund requests fetched successfully", rows);
});

export const triggerSubscriptionExpiryNotifications = asyncHandler(async (req, res) => {
  const expiryResult = await expireSubscriptionsAndNotify();
  const result = await sendExpiringSubscriptionNotifications(3);

  return sendSuccess(
    res,
    200,
    "Subscription expiry notifications processed successfully",
    {
      ...result,
      expiredSubscriptionsUpdated: expiryResult.expiredCount,
      expiryNotificationsCreated: expiryResult.notifiedCount,
    }
  );
});