import express from "express";
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  broadcastNotification,
  getAllNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/notifications", protect, getNotifications);

router.put("/notifications/:id/read", protect, markRead);

router.put("/notifications/read-all", protect, markAllRead);

router.delete("/notifications/:id", protect, deleteNotification);

router.post(
  "/admin/notifications/broadcast",
  protect,
  authorizeRoles("hostel_admin"),
  broadcastNotification,
);

router.get(
  "/admin/notifications",
  protect,
  authorizeRoles("hostel_admin"),
  getAllNotifications,
);

export default router;
