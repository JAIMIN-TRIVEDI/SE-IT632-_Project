import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
    getAvailableRooms,
    getMyRoomRequest,
    createRoomRequest,
    getWardenRoomRequests,
    reviewRoomRequest,
} from "../controllers/roomRequestController.js";

const router = express.Router();

router.get("/room-requests/available", protect, authorizeRoles("student"), getAvailableRooms);
router.get("/room-requests/me", protect, authorizeRoles("student"), getMyRoomRequest);
router.post("/room-requests", protect, authorizeRoles("student"), createRoomRequest);
router.get("/room-requests/warden", protect, authorizeRoles("warden"), getWardenRoomRequests);
router.put("/room-requests/:id/review", protect, authorizeRoles("warden"), reviewRoomRequest);

export default router;
