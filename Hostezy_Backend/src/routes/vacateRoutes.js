import express from "express";
import {
  requestVacate,
  approveVacate,
  rejectVacate,
} from "../controllers/vacateController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
const router = express.Router();


router.post(
  "/vacate-request",
  protect,
  authorizeRoles("student"),
  requestVacate,
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