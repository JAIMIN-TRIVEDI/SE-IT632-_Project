import express from "express";
import {
  createRoom,
  getRoom,
  allocateRoom,
} from "../controllers/roomController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { updateRoom, deleteRoom, vacateRoom } from "../controllers/roomController.js";
const router = express.Router();

router.post(
  "/hostels/:id/rooms",
  protect,
  authorizeRoles("hostel_admin"),
  createRoom,
);

router.get("/rooms/:id", protect, getRoom);

router.post(
  "/rooms/:id/allocate",
  protect,
  authorizeRoles("hostel_admin"),
  allocateRoom,
);

router.put("/rooms/:id", protect, authorizeRoles("hostel_admin"), updateRoom);

router.delete(
  "/rooms/:id",
  protect,
  authorizeRoles("hostel_admin"),
  deleteRoom,
);

router.post(
  "/rooms/:id/vacate",
  protect,
  authorizeRoles("warden", "hostel_admin"),
  vacateRoom,
);

export default router;
