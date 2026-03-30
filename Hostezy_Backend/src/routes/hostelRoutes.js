import express from "express";
import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  assignWarden
} from "../controllers/hostelController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.get("/", protect, getHostels);

router.post("/", protect, authorizeRoles("hostel_admin"), createHostel);

router.get("/:id", protect, getHostelById);

router.put("/:id", protect, authorizeRoles("hostel_admin"), updateHostel);

router.delete("/:id", protect, authorizeRoles("hostel_admin"), deleteHostel);

router.put(
  "/:id/assign-warden",
  protect,
  authorizeRoles("hostel_admin"),
  assignWarden,
);

export default router;
