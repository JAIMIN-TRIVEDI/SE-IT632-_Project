import express from "express";
import {
  adminDashboard,
  wardenDashboard,
  occupancyReport,
  paymentReport,
  complaintReport,
  messReport,
  hostelStudentsReport,
} from "../controllers/reportController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard/admin",
  protect,
  authorizeRoles("hostel_admin"),
  adminDashboard,
);

router.get(
  "/dashboard/warden",
  protect,
  authorizeRoles("warden"),
  wardenDashboard,
);

router.get(
  "/reports/occupancy",
  protect,
  authorizeRoles("hostel_admin"),
  occupancyReport,
);

router.get(
  "/reports/payments",
  protect,
  authorizeRoles("hostel_admin"),
  paymentReport,
);

router.get(
  "/students-by-hostel",
  protect,
  authorizeRoles("hostel_admin"),
  hostelStudentsReport,
);

router.get(
  "/reports/complaints",
  protect,
  authorizeRoles("hostel_admin"),
  complaintReport,
);

router.get("/reports/mess", protect, authorizeRoles("mess_admin"), messReport);

export default router;
