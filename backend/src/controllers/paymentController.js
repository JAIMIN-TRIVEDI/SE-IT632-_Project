import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import RoomRequest from "../models/RoomRequest.js";
import Room from "../models/Room.js";
import RoomAllocation from "../models/RoomAllocation.js";
import { sendPaymentSuccessNotification } from "../services/notificationService.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const updatePaymentFailureStatus = async ({
  orderId,
  paymentId,
  reason = "Payment failed",
}) => {
  const payment = await Payment.findOne({
    ...(orderId ? { orderId } : {}),
    ...(paymentId ? { paymentId } : {}),
  });

  if (!payment) {
    return null;
  }

  if (payment.status === "success") {
    return payment;
  }

  payment.status = "failed";
  payment.failureReason = reason;
  payment.failedAt = new Date();
  await payment.save();

  return payment;
};

export const createOrder = async (req, res) => {

  const { amount, purpose, subscriptionId, type } = req.body;

  let payableAmount = Number(amount);
  let payablePurpose = purpose;

  if ((type || "room_request") === "room_request") {
    if (!subscriptionId) {
      return res.status(400).json({ message: "Room request reference is required." });
    }

    const roomRequest = await RoomRequest.findById(subscriptionId)
      .populate({ path: "roomId", select: "roomNumber roomType capacity occupiedCount status" });

    if (!roomRequest) {
      return res.status(404).json({ message: "Room request not found." });
    }

    if (roomRequest.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not allowed to pay for this room request." });
    }

    if (roomRequest.status !== "approved") {
      return res.status(400).json({ message: "Room request is not approved yet." });
    }

    if (roomRequest.paymentStatus === "paid") {
      return res.status(400).json({ message: "Payment already completed for this room request." });
    }

    const room = roomRequest.roomId;
    const isRoomAvailable = room
      && room.status === "available"
      && Number(room.occupiedCount || 0) < Number(room.capacity || 0);

    if (!isRoomAvailable) {
      return res.status(400).json({
        message: "Selected room is no longer available. Please submit a new request.",
      });
    }

    const existingSuccessPayment = await Payment.findOne({
      userId: req.user._id,
      type: "room_request",
      subscriptionId,
      status: "success",
    }).lean();

    if (existingSuccessPayment) {
      return res.status(400).json({ message: "Payment already completed for this room request." });
    }

    payableAmount = Number(roomRequest.amount);
    payablePurpose = `Room request payment for Room ${room.roomNumber}`;
  }

  if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount." });
  }

  const options = {
    amount: payableAmount * 100,
    currency: "INR"
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    userId: req.user._id,
    type: type || "room_request",
    amount: payableAmount,
    orderId: order.id,
    purpose: payablePurpose,
    subscriptionId,
    status: "pending",
  });

  res.json({
    success: true,
    order,
    payment
  });

};

export const verifyPayment = async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const sign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (sign !== razorpay_signature) {
    await updatePaymentFailureStatus({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      reason: "Invalid payment signature",
    });
    return res.status(400).json({ message: "Invalid signature" });
  }

  const payment = await Payment.findOne({
    orderId: razorpay_order_id
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  if (payment.status === "success") {
    return res.json({
      success: true,
      message: "Payment already verified"
    });
  }

  payment.status = "success";
  payment.paymentId = razorpay_payment_id;
  payment.failureReason = "";
  payment.failedAt = undefined;
  await payment.save();

  await sendPaymentSuccessNotification({
    userId: payment.userId,
    amount: payment.amount,
    purpose: payment.purpose,
  });

  if (payment.subscriptionId) {
    const roomRequest = await RoomRequest.findById(payment.subscriptionId);
    if (roomRequest && roomRequest.paymentStatus === "pending") {
      if (roomRequest.status !== "approved") {
        return res.status(400).json({ message: "Room request is not approved." });
      }

      const existingAllocation = await RoomAllocation.findOne({
        studentId: payment.userId,
        status: "active",
      }).lean();

      if (existingAllocation) {
        return res.status(400).json({ message: "Student already has an active room allocation." });
      }

      const room = await Room.findById(roomRequest.roomId);
      const isRoomAvailable = room
        && room.status === "available"
        && Number(room.occupiedCount || 0) < Number(room.capacity || 0);

      if (!isRoomAvailable) {
        return res.status(400).json({
          message: "Selected room is no longer available. Please contact your warden.",
        });
      }

      room.occupiedCount += 1;
      if (room.occupiedCount >= room.capacity) {
        room.status = "full";
      }
      await room.save();

      await RoomAllocation.create({
        studentId: payment.userId,
        roomId: room._id,
        hostelId: room.hostelId,
        status: "active",
      });

      roomRequest.paymentStatus = "paid";
      await roomRequest.save();
    }
  }

  res.json({
    success: true,
    message: "Payment verified"
  });

};

export const getPaymentHistory = async (req, res) => {

  const payments = await Payment.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: payments
  });

};

export const getRazorpayKey = async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
};

export const getPaymentById = async (req, res) => {

  const payment = await Payment.findById(req.params.id);

  res.json({
    success: true,
    data: payment
  });

};

export const getAllPayments = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const {
    search = "",
    status = "all",
    type = "all",
    fromDate,
    toDate,
  } = req.query;

  const baseMatch = {};

  if (status !== "all") {
    baseMatch.status = status;
  }

  if (type !== "all") {
    baseMatch.type = type;
  }

  if (fromDate || toDate) {
    baseMatch.createdAt = {};
    if (fromDate) {
      baseMatch.createdAt.$gte = new Date(fromDate);
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      baseMatch.createdAt.$lte = end;
    }
  }

  const normalizedSearch = String(search).trim();
  const searchRegex = normalizedSearch ? new RegExp(escapeRegex(normalizedSearch), "i") : null;

  const searchMatch = searchRegex
    ? {
      $or: [
        { purpose: searchRegex },
        { orderId: searchRegex },
        { paymentId: searchRegex },
        { tenantName: searchRegex },
        { tenantEmail: searchRegex },
        { hostelName: searchRegex },
      ],
    }
    : null;

  const pipeline = [
    { $match: baseMatch },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "roomrequests",
        localField: "subscriptionId",
        foreignField: "_id",
        as: "subscription",
      },
    },
    {
      $unwind: {
        path: "$subscription",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "hostels",
        localField: "subscription.hostelId",
        foreignField: "_id",
        as: "hostel",
      },
    },
    {
      $unwind: {
        path: "$hostel",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "subscription.roomId",
        foreignField: "_id",
        as: "room",
      },
    },
    {
      $unwind: {
        path: "$room",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        tenantName: { $ifNull: ["$user.name", "Unknown tenant"] },
        tenantEmail: { $ifNull: ["$user.email", "--"] },
        hostelName: { $ifNull: ["$hostel.name", "--"] },
        roomNumber: {
          $ifNull: [{ $toString: "$room.roomNumber" }, "--"],
        },
        transactionId: {
          $ifNull: [
            "$paymentId",
            {
              $ifNull: [
                "$orderId",
                {
                  $concat: ["TXN-", { $toUpper: { $substrBytes: [{ $toString: "$_id" }, 18, 6] } }],
                },
              ],
            },
          ],
        },
      },
    },
  ];

  if (searchMatch) {
    pipeline.push({ $match: searchMatch });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            transactionId: 1,
            tenantName: 1,
            tenantEmail: 1,
            hostelName: 1,
            roomNumber: 1,
            date: "$createdAt",
            amount: 1,
            status: 1,
            type: 1,
            purpose: { $ifNull: ["$purpose", "--"] },
            paymentMethod: {
              $cond: [{ $ifNull: ["$paymentId", false] }, "Razorpay", "--"],
            },
          },
        },
      ],
      count: [{ $count: "total" }],
      metrics: [
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ["$status", "success"] }, "$amount", 0],
              },
            },
            pendingDues: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
              },
            },
            activeSubscriptions: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "success"] },
                      { $in: ["$type", ["hostel", "room_request"]] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ],
    },
  });

  const [result] = await Payment.aggregate(pipeline);
  const total = result?.count?.[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const metrics = result?.metrics?.[0] || {
    totalRevenue: 0,
    pendingDues: 0,
    activeSubscriptions: 0,
  };

  res.json({
    success: true,
    page,
    limit,
    total,
    totalPages,
    metrics: {
      totalRevenue: metrics.totalRevenue || 0,
      pendingDues: metrics.pendingDues || 0,
      activeSubscriptions: metrics.activeSubscriptions || 0,
    },
    data: result?.data || [],
  });

};
export const refundPayment = async (req, res) => {

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  if (payment.status === "refunded") {
    return res.json({ success: true, message: "Payment already refunded" });
  }

  await razorpay.payments.refund(payment.paymentId);

  payment.status = "refunded";
  payment.refundedAt = new Date();

  await payment.save();

  res.json({
    success: true,
    message: "Refund successful"
  });

};

export const markPaymentFailed = async (req, res) => {
  try {
    const { orderId, paymentId, reason } = req.body;

    if (!orderId && !paymentId) {
      return res.status(400).json({ message: "orderId or paymentId is required." });
    }

    const payment = await updatePaymentFailureStatus({
      orderId,
      paymentId,
      reason: reason || "Payment was cancelled or failed",
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    return res.json({ success: true, message: "Payment marked as failed", data: payment });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};