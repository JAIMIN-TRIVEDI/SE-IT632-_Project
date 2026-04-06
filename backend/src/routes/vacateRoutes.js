import express from "express";
import {
  requestVacate,
  getMyVacateRequest,
  getHostelAdminVacateRequests,
  approveVacate,
  rejectVacate,
} from "../controllers/vacateController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.post(
  "/vacate-requests",
  protect,
  authorizeRoles("student"),
  requestVacate,
);

router.get(
  "/vacate-requests/me",
  protect,
  authorizeRoles("student"),
  getMyVacateRequest,
);

router.get(
  "/vacate-requests/admin",
  protect,
  authorizeRoles("hostel_admin"),
  getHostelAdminVacateRequests,
);

router.put(
  "/vacate-requests/:id/approve",
  protect,
  authorizeRoles("hostel_admin"),
  approveVacate,
);

router.put(
  "/vacate-requests/:id/reject",
  protect,
  authorizeRoles("hostel_admin"),
  rejectVacate,
);

export default router;