import MessPlan from "../models/MessPlan.js";
import MessSubscription from "../models/MessSubscription.js";
import MessMenu from "../models/MessMenu.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
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
    return "cancellation_requested";
  }

  if (subscription.status === "cancelled" || subscription.status === "refund_approved") {
    return "cancelled";
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
  const items = result?.items || [];
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
        preserveNullAndEmptyArrays: true,
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
                then: "cancelled",
              },
            ],
            default: "none",
          },
        },
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
  const items = result?.items || [];
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
                then: "cancellation_requested",
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
                then: "refund_approved",
              },
              {
                case: { $eq: ["$currentSubscription.status", "cancelled"] },
                then: "cancelled",
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
  const items = result?.items || [];
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

  const [activeSubscriptionsAgg, totalPlansAgg, monthlyRevenueAgg, pendingRefundsAgg] = await Promise.all([
    MessSubscription.aggregate([
      {
        $match: {
          status: "active",
          endDate: { $gte: now },
        },
      },
      { $count: "total" },
    ]),
    MessPlan.aggregate([{ $count: "total" }]),
    Payment.aggregate([
      {
        $match: {
          type: "mess",
          status: "success",
          createdAt: {
            $gte: monthStart,
            $lt: nextMonthStart,
          },
          purpose: { $ne: "Mess Refund" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    MessSubscription.aggregate([
      {
        $match: {
          $or: [
            {
              "refund.requested": true,
              "refund.approved": false,
            },
            {
              status: "refund_pending",
            },
          ],
        },
      },
      { $count: "total" },
    ]),
  ]);

  const dashboardStats = {
    totalActiveSubscriptions: activeSubscriptionsAgg[0]?.total || 0,
    totalPlans: totalPlansAgg[0]?.total || 0,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    pendingRefundsCount: pendingRefundsAgg[0]?.total || 0,
  };

  return sendSuccess(
    res,
    200,
    "Mess admin dashboard stats fetched successfully",
    dashboardStats
  );
});

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await MessSubscription.findOne({
      studentId: req.user._id,
      status: "active"
    }).populate("planId");

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found." });
    }

    if (subscription.refund?.requested && !subscription.refund?.approved) {
      return res.status(400).json({ message: "Cancellation is already requested." });
    }

    const today = new Date();
    const start = new Date(subscription.startDate);

    // Calculate used days (minimum 1 day)
    let usedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    if (usedDays <= 0) usedDays = 1;

    const totalDays = subscription.planId.durationInDays;
    const perDay = subscription.planId.price / totalDays;

    const refundAmount =
      subscription.planId.price - usedDays * perDay;

    // Keep the subscription active until the mess admin approves the refund
    subscription.status = "active";
    subscription.refund = {
      requested: true,
      approved: false,
      amount: Math.max(0, Math.floor(refundAmount)),
    };

    await subscription.save();
    const updatedSubscription = await MessSubscription.findById(subscription._id).populate("planId");

    res.json({
      success: true,
      message: "Cancellation request submitted",
      refundAmount: subscription.refund.amount,
      subscription: updatedSubscription,
      currentStatus: getSubscriptionCurrentStatus(updatedSubscription),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    const subscription = await MessSubscription.findById(req.params.id);

    if (!subscription || !subscription.refund?.requested) {
      return res.status(400).json({ message: "Invalid request" });
    }

    subscription.status = "refund_approved";
    subscription.refund.approved = true;
    subscription.endDate = new Date();

    await subscription.save();

    const paymentToRefund = await Payment.findOne({
      userId: subscription.studentId,
      type: "mess",
      status: "success",
      purpose: { $ne: "Mess Refund" },
    }).sort({ createdAt: -1 });

    if (paymentToRefund) {
      // Keep schema unchanged while updating persisted payment status as requested.
      await Payment.collection.updateOne(
        { _id: paymentToRefund._id },
        {
          $set: {
            status: "refunded",
            updatedAt: new Date(),
          },
        }
      );
    }

    return sendSuccess(res, 200, "Refund approved successfully", {
      subscriptionId: subscription._id,
      paymentId: paymentToRefund?._id || null,
      paymentStatus: paymentToRefund ? "refunded" : "not_found",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

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