import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getAllPayments,
  refundPayment,
} from "../controllers/paymentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/payments/order", protect, authorizeRoles("student"), createOrder);

router.post("/payments/verify", protect, verifyPayment);

router.get(
  "/payments/history",
  protect,
  authorizeRoles("student"),
  getPaymentHistory,
);

router.get("/payments/:id", protect, getPaymentById);

router.get(
  "/admin/payments",
  protect,
  authorizeRoles("hostel_admin"),
  getAllPayments,
);

router.post(
  "/payments/refund/:id",
  protect,
  authorizeRoles("hostel_admin"),
  refundPayment,
);

export default router;
