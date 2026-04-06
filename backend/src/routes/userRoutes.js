import express from "express";
import { getProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import RoomAllocation from "../models/RoomAllocation.js";
import RoomRequest from "../models/RoomRequest.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import Complaint from "../models/Complaint.js";
import MessSubscription from "../models/MessSubscription.js";
import VacateRequest from "../models/VacateRequest.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

// router.get("/dashboard", protect, (req, res) => {
//   res.json({
//     success: true,
//     user: req.user
//   });
// });

router.get("/student/dashboard", protect, async (req, res) => {
  try {
    const user = req.user;

    const allocation = await RoomAllocation.findOne({ studentId: user._id, status: 'active' })
      .populate({ path: 'roomId', select: 'roomNumber capacity status' })
      .populate({ path: 'hostelId', select: 'name type' });

    const payments = await Payment.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const messSubscription = await MessSubscription.findOne({ studentId: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'planId', select: 'name durationInDays price' })
      .lean();

    let messCurrentStatus = 'none';
    if (messSubscription) {
      if (messSubscription.refund?.requested && !messSubscription.refund?.approved) {
        messCurrentStatus = 'cancellation_requested';
      } else if (messSubscription.status === 'cancelled' || messSubscription.status === 'refund_approved') {
        messCurrentStatus = 'cancelled';
      } else if (
        messSubscription.status === 'expired' ||
        (messSubscription.status === 'active' && messSubscription.endDate && new Date(messSubscription.endDate) < new Date())
      ) {
        messCurrentStatus = 'expired';
      } else if (messSubscription.status === 'active') {
        messCurrentStatus = 'active';
      } else {
        messCurrentStatus = messSubscription.status;
      }
    }

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean();
    const openComplaints = await Complaint.countDocuments({ studentId: user._id, status: { $ne: 'resolved' } });
    const roomRequest = await RoomRequest.findOne({ studentId: user._id }).sort({ createdAt: -1 }).populate({ path: 'roomId', select: 'roomNumber roomType price status hostelId' }).populate({ path: 'hostelId', select: 'name type' }).lean();
    const vacateRequest = await VacateRequest.findOne({ studentId: user._id }).sort({ createdAt: -1 }).lean();

    let roommates = [];
    if (allocation) {
      const roomAllocations = await RoomAllocation.find({ roomId: allocation.roomId, status: 'active' }).populate({ path: 'studentId', select: 'name email' }).lean();
      roommates = roomAllocations
        .filter((item) => item.studentId._id.toString() !== user._id.toString())
        .map((item) => ({
          id: item._id,
          name: item.studentId.name,
          initials: item.studentId.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2),
        }));
    }

    const room = allocation
      ? {
        roomNumber: allocation.roomId?.roomNumber || null,
        capacity: allocation.roomId?.capacity || null,
        status: allocation.roomId?.status || null,
        hostelName: allocation.hostelId?.name || null,
        hostelType: allocation.hostelId?.type || null,
        moveInDate: allocation.allocatedAt || null,
      }
      : null;

    const dashboardData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        enrollmentNo: user.enrollmentNo,
        gender: user.gender,
        role: user.role,
      },
      room,
      payments,
      messSubscription,
      messCurrentStatus,
      notifications,
      openComplaints,
      roomRequest,
      vacateRequest,
      roommates,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin only example
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default router;