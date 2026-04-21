import { body, param } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createMessPlanService,
  deleteMessPlanService,
  getAllMessPlansService,
  updateMessPlanService,
} from "../services/messPlanService.js";

const statusValues = ["active", "inactive"];
const mealValues = ["breakfast", "lunch", "snacks", "dinner"];

export const createMessPlanValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("price")
    .notEmpty()
    .withMessage("price is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("price must be a number greater than 0"),
  body("status")
    .optional()
    .isIn(statusValues)
    .withMessage("status must be one of: active, inactive"),
  body("meals")
    .optional()
    .custom((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("meals must be an object");
      }

      const selectedMeals = mealValues.filter((meal) => Boolean(value[meal]));

      if (selectedMeals.length === 0) {
        throw new Error("At least one meal must be selected");
      }

      return true;
    }),
  body().custom((value) => {
    const duration = value.duration ?? value.durationInDays;

    if (duration === undefined) {
      throw new Error("duration is required");
    }

    const parsed = Number(duration);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("duration must be a positive integer");
    }

    return true;
  }),
];

export const updateMessPlanValidation = [
  param("id").isMongoId().withMessage("Invalid mess plan id"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("price must be a number greater than 0"),
  body("status")
    .optional()
    .isIn(statusValues)
    .withMessage("status must be one of: active, inactive"),
  body("meals")
    .optional()
    .custom((value) => {
      if (value === undefined) {
        return true;
      }

      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("meals must be an object");
      }

      const selectedMeals = mealValues.filter((meal) => Boolean(value[meal]));

      if (selectedMeals.length === 0) {
        throw new Error("At least one meal must be selected");
      }

      return true;
    }),
  body().custom((value) => {
    const hasAnyUpdatableField =
      value.name !== undefined ||
      value.price !== undefined ||
      value.duration !== undefined ||
      value.durationInDays !== undefined ||
      value.status !== undefined;

    if (!hasAnyUpdatableField) {
      throw new Error("At least one field is required to update");
    }

    if (value.duration !== undefined || value.durationInDays !== undefined) {
      const duration = value.duration ?? value.durationInDays;
      const parsed = Number(duration);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("duration must be a positive integer");
      }
    }

    return true;
  }),
];

export const deleteMessPlanValidation = [
  param("id").isMongoId().withMessage("Invalid mess plan id"),
];

export const getAllMessPlans = asyncHandler(async (req, res) => {
  const plans = await getAllMessPlansService(req.query.search || "");
  return sendSuccess(res, 200, "Mess plans fetched successfully", plans);
});

export const createMessPlan = asyncHandler(async (req, res) => {
  const plan = await createMessPlanService(req.body, req.user._id);
  return sendSuccess(res, 201, "Mess plan created successfully", plan);
});

export const updateMessPlan = asyncHandler(async (req, res) => {
  const plan = await updateMessPlanService(req.params.id, req.body);
  return sendSuccess(res, 200, "Mess plan updated successfully", plan);
});

export const deleteMessPlan = asyncHandler(async (req, res) => {
  await deleteMessPlanService(req.params.id);
  return sendSuccess(res, 200, "Mess plan deleted successfully", null);
});
