import express from "express";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  subscribePlan,
  getMySubscription,
  cancelSubscription,
  getSubscriptions,
  getStudents,
  getPayments,
  getStudentsByPlan,
  getPaymentsByPlan,
  getMenu,
  updateMenu,
  renewSubscription,
  createMessOrder,
  verifyMessPayment,
  approveRefund
} from "../controllers/messController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ── Plans ──────────────────────────────────────────────────────────────────
router.get("/mess/plans", protect, getPlans);
router.post("/mess/plans", protect, authorizeRoles("mess_admin"), createPlan);
router.put("/mess/plans/:id", protect, authorizeRoles("mess_admin"), updatePlan);
router.delete("/mess/plans/:id", protect, authorizeRoles("mess_admin"), deletePlan);

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
router.get("/mess/students", protect, authorizeRoles("mess_admin"), getStudents);
router.get("/mess/payments", protect, authorizeRoles("mess_admin"), getPayments);
router.get("/mess/plans/:planId/students", protect, authorizeRoles("mess_admin"), getStudentsByPlan);
router.get("/mess/plans/:planId/payments", protect, authorizeRoles("mess_admin"), getPaymentsByPlan);
router.post("/mess/subscription/refund/:id", protect, authorizeRoles("mess_admin"), approveRefund);
// ── Menu ───────────────────────────────────────────────────────────────────
router.get("/mess/menu", protect, getMenu);
router.put("/mess/menu", protect, authorizeRoles("mess_admin"), updateMenu);

export default router;