import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import RoomRequest from "../models/RoomRequest.js";
import Room from "../models/Room.js";
import RoomAllocation from "../models/RoomAllocation.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createOrder = async (req, res) => {

  const { amount, purpose, subscriptionId, type } = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR"
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    userId: req.user._id,
    type: type || "room_request",
    amount,
    orderId: order.id,
    purpose,
    subscriptionId
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
    return res.status(400).json({ message: "Invalid signature" });
  }

  const payment = await Payment.findOne({
    orderId: razorpay_order_id
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  payment.status = "success";
  payment.paymentId = razorpay_payment_id;
  await payment.save();

  if (payment.subscriptionId) {
    const roomRequest = await RoomRequest.findById(payment.subscriptionId);
    if (roomRequest && roomRequest.paymentStatus === "pending") {
      roomRequest.paymentStatus = "paid";
      roomRequest.status = "approved";
      await roomRequest.save();

      const room = await Room.findById(roomRequest.roomId);
      if (room && room.status === "available") {
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
      }
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

  await razorpay.payments.refund(payment.paymentId);

  payment.status = "refunded";

  await payment.save();

  res.json({
    success: true,
    message: "Refund successful"
  });

};