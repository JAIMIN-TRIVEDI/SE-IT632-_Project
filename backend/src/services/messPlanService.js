import MessPlan from "../models/MessPlan.js";
import AppError from "../utils/AppError.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePlan = (planDoc) => {
  const plan = planDoc.toObject ? planDoc.toObject() : planDoc;

  return {
    ...plan,
    duration: plan.durationInDays,
    // Status is exposed for API contract compatibility without schema changes.
    status: "active",
  };
};

const resolveDuration = (payload) => payload.duration ?? payload.durationInDays;

export const getAllMessPlansService = async (search = "") => {
  const normalizedSearch = search.trim();

  if (!normalizedSearch) {
    const plans = await MessPlan.find().sort({ createdAt: -1 });
    return plans.map(normalizePlan);
  }

  const safeSearch = escapeRegex(normalizedSearch);
  const plans = await MessPlan.aggregate([
    {
      $addFields: {
        priceAsString: { $toString: "$price" },
      },
    },
    {
      $match: {
        $or: [
          { name: { $regex: safeSearch, $options: "i" } },
          { priceAsString: { $regex: safeSearch, $options: "i" } },
        ],
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        priceAsString: 0,
      },
    },
  ]);

  return plans.map(normalizePlan);
};

export const createMessPlanService = async (payload, userId) => {
  const duration = Number(resolveDuration(payload));

  const plan = await MessPlan.create({
    name: payload.name,
    price: Number(payload.price),
    durationInDays: duration,
    createdBy: userId,
  });

  return normalizePlan(plan);
};

export const updateMessPlanService = async (planId, payload) => {
  const updateData = {};

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.price !== undefined) updateData.price = Number(payload.price);

  const duration = resolveDuration(payload);
  if (duration !== undefined) {
    updateData.durationInDays = Number(duration);
  }

  const updatedPlan = await MessPlan.findByIdAndUpdate(planId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedPlan) {
    throw new AppError("Mess plan not found", 404);
  }

  return normalizePlan(updatedPlan);
};

export const deleteMessPlanService = async (planId) => {
  const deletedPlan = await MessPlan.findByIdAndDelete(planId);

  if (!deletedPlan) {
    throw new AppError("Mess plan not found", 404);
  }

  return null;
};
