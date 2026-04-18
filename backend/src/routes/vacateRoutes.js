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
  "/vacate-requests/warden",
  protect,
  authorizeRoles("warden"),
  getHostelAdminVacateRequests,
);

router.put(
  "/vacate-requests/:id/approve",
  protect,
  authorizeRoles("warden"),
  approveVacate,
);

router.put(
  "/vacate-requests/:id/reject",
  protect,
  authorizeRoles("warden"),
  rejectVacate,
);

export default router;