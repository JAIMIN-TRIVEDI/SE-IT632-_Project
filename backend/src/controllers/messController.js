import MessPlan from "../models/MessPlan.js";
import MessSubscription from "../models/MessSubscription.js";
import MessMenu from "../models/MessMenu.js";

export const getPlans = async (req, res) => {

  const plans = await MessPlan.find();

  res.json({
    success: true,
    data: plans
  });

};

export const createPlan = async (req, res) => {

  const plan = await MessPlan.create(req.body);

  res.status(201).json({
    success: true,
    data: plan
  });

};

export const updatePlan = async (req, res) => {

  const plan = await MessPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    success: true,
    data: plan
  });

};

export const deletePlan = async (req, res) => {

  await MessPlan.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Plan deleted"
  });

};

export const subscribePlan = async (req, res) => {

  const { planId, startDate } = req.body;

  const plan = await MessPlan.findById(planId);

  const start = startDate ? new Date(startDate) : new Date();

  let end = new Date(start);

  end.setDate(end.getDate() + (plan.durationInDays ?? 30));

  const subscription = await MessSubscription.create({
    studentId: req.user._id,
    planId,
    startDate: start,
    endDate: end
  });

  res.status(201).json({
    success: true,
    data: subscription
  });

};

export const getMySubscription = async (req, res) => {

  const subscription = await MessSubscription.findOne({
    studentId: req.user._id
  }).populate("planId");

  res.json({
    success: true,
    data: subscription
  });

};

export const cancelSubscription = async (req, res) => {

  const subscription = await MessSubscription.findOne({
    studentId: req.user._id
  });

  subscription.status = "cancelled";

  await subscription.save();

  res.json({
    success: true,
    message: "Subscription cancelled"
  });

};

export const getMenu = async (req, res) => {

  const menu = await MessMenu.findOne().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: menu
  });

};

export const updateMenu = async (req, res) => {

  const menu = await MessMenu.create(req.body);

  res.json({
    success: true,
    data: menu
  });

};

export const renewSubscription = async (req, res) => {

  try {

    const subscription = await MessSubscription.findOne({
      studentId: req.user._id
    });

    const plan = await MessPlan.findById(subscription.planId);

    let newEnd = new Date(subscription.endDate);

    if (plan.duration === "weekly") {
      newEnd.setDate(newEnd.getDate() + 7);
    } else {
      newEnd.setDate(newEnd.getDate() + 30);
    }

    subscription.endDate = newEnd;

    await subscription.save();

    res.json({
      success: true,
      data: subscription
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};