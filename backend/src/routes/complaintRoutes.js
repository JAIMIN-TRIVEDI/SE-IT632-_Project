import express from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  resolveComplaint,
  deleteComplaint,
} from "../controllers/complaintController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/complaints", protect, authorizeRoles("student"), createComplaint);

router.get("/complaints", protect, getComplaints);

router.get("/complaints/:id", protect, getComplaintById);

router.put(
  "/complaints/:id/status",
  protect,
  authorizeRoles("warden", "hostel_admin"),
  updateComplaintStatus,
);

router.put(
  "/complaints/:id/resolve",
  protect,
  authorizeRoles("warden"),
  resolveComplaint,
);

router.delete(
  "/complaints/:id",
  protect,
  authorizeRoles("student"),
  deleteComplaint,
);

export default router;
