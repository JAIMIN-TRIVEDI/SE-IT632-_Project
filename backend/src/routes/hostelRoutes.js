import express from "express";
import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  assignWarden
} from "../controllers/hostelController.js";
import {
  getAcademicSettingsForAdmin,
  getPublicAcademicSettings,
  updateAcademicSettings,
} from "../controllers/academicSettingsController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.get("/academic-settings/public", getPublicAcademicSettings);

router.get(
  "/academic-settings",
  protect,
  authorizeRoles("hostel_admin"),
  getAcademicSettingsForAdmin,
);

router.put(
  "/academic-settings",
  protect,
  authorizeRoles("hostel_admin"),
  updateAcademicSettings,
);

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
