import express from "express";
import {
  subscribePlan,
  getMySubscription,
  cancelSubscription,
  getSubscriptions,
  getAllSubscriptionsWithDetails,
  getStudents,
  getAllMessPayments,
  getStudentsWithCurrentPlanStatus,
  getPayments,
  getStudentsByPlan,
  getPaymentsByPlan,
  getMenu,
  updateMenu,
  renewSubscription,
  createMessOrder,
  verifyMessPayment,
  approveRefund,
  getMessAdminDashboardStats,
} from "../controllers/messController.js";
import {
  createMessPlan,
  createMessPlanValidation,
  deleteMessPlan,
  deleteMessPlanValidation,
  getAllMessPlans,
  updateMessPlan,
  updateMessPlanValidation,
} from "../controllers/messPlanController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// ── Plans ──────────────────────────────────────────────────────────────────
router.get("/mess/plans", protect, getAllMessPlans);
router.post(
  "/mess/plans",
  protect,
  authorizeRoles("mess_admin"),
  createMessPlanValidation,
  validateRequest,
  createMessPlan
);
router.put(
  "/mess/plans/:id",
  protect,
  authorizeRoles("mess_admin"),
  updateMessPlanValidation,
  validateRequest,
  updateMessPlan
);
router.delete(
  "/mess/plans/:id",
  protect,
  authorizeRoles("mess_admin"),
  deleteMessPlanValidation,
  validateRequest,
  deleteMessPlan
);

// ── Razorpay payment flow for mess subscription ────────────────────────────
// POST /api/v1/mess/order  → creates Razorpay order
router.post("/mess/order", protect, authorizeRoles("student"), createMessOrder);
// POST /api/v1/mess/verify → verifies payment & creates MessSubscription
router.post("/mess/verify", protect, authorizeRoles("student"), verifyMessPayment);

// ── Legacy direct-subscribe (kept for backward compat) ─────────────────────
router.post("/mess/subscribe", protect, authorizeRoles("student"), subscribePlan);

// ── Subscription management ────────────────────────────────────────────────
router.get("/mess/subscription/me", protect, authorizeRoles("student"), getMySubscription);
router.post("/mess/subscription/cancel", protect, authorizeRoles("student"), cancelSubscription);
router.post("/mess/subscription/renew", protect, authorizeRoles("student"), renewSubscription);
router.get("/mess/subscriptions", protect, authorizeRoles("mess_admin"), getSubscriptions);
router.get("/mess/subscriptions/details", protect, authorizeRoles("mess_admin"), getAllSubscriptionsWithDetails);
router.get("/mess/students", protect, authorizeRoles("mess_admin"), getStudents);
router.get("/mess/students/current-plan", protect, authorizeRoles("mess_admin"), getStudentsWithCurrentPlanStatus);
router.get("/mess/payments/all", protect, authorizeRoles("mess_admin"), getAllMessPayments);
router.get("/mess/payments", protect, authorizeRoles("mess_admin"), getPayments);
router.get("/mess/dashboard/stats", protect, authorizeRoles("mess_admin"), getMessAdminDashboardStats);
router.get("/mess/plans/:planId/students", protect, authorizeRoles("mess_admin"), getStudentsByPlan);
router.get("/mess/plans/:planId/payments", protect, authorizeRoles("mess_admin"), getPaymentsByPlan);
router.post("/mess/subscription/refund/:id", protect, authorizeRoles("mess_admin"), approveRefund);
router.patch("/mess/subscriptions/:id/refund/approve", protect, authorizeRoles("mess_admin"), approveRefund);
// ── Menu ───────────────────────────────────────────────────────────────────
router.get("/mess/menu", protect, getMenu);
router.put("/mess/menu", protect, authorizeRoles("mess_admin"), updateMenu);

export default router;