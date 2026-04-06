import MessPlan from "../models/MessPlan.js";
import MessSubscription from "../models/MessSubscription.js";
import MessMenu from "../models/MessMenu.js";
import Payment from "../models/Payment.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

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

export const getPlans = async (req, res) => {
  const plans = await MessPlan.find();
  res.json({ success: true, data: plans });
};

export const createPlan = async (req, res) => {
  const plan = await MessPlan.create(req.body);
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
    payment.type = "mess";
    payment.purpose = `Mess plan: ${plan.name}`;
    await payment.save();

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
  const plan = await MessPlan.findById(planId);
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (plan.durationInDays ?? 30));
  const subscription = await MessSubscription.create({
    studentId: req.user._id,
    planId,
    startDate: start,
    endDate: end,
  });
  res.status(201).json({ success: true, data: subscription });
};

export const getMySubscription = async (req, res) => {
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

export const getMenu = async (req, res) => {
  const menu = await MessMenu.findOne().sort({ createdAt: -1 });
  res.json({ success: true, data: menu });
};

export const updateMenu = async (req, res) => {
  const menu = await MessMenu.create(req.body);
  res.json({ success: true, data: menu });
};

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

    subscription.status = "cancelled";
    subscription.refund.approved = true;

    await subscription.save();

    await Payment.create({
      userId: subscription.studentId,
      type: "mess",
      amount: subscription.refund.amount,
      purpose: "Mess Refund",
      status: "success"
    });

    res.json({ success: true, message: "Refund approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};