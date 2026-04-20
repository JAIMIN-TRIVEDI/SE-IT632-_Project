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
import {
  getRenewalInfoFromAllocation,
  processRoomRenewalLifecycle,
} from "../services/roomRenewalService.js";

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

    await processRoomRenewalLifecycle({ studentId: user._id });

    const allocation = await RoomAllocation.findOne({ studentId: user._id, status: 'active' })
      .populate({ path: 'roomId', select: 'roomNumber roomType capacity status price' })
      .populate({ path: 'hostelId', select: 'name type' });

    const payments = await Payment.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const messSubscription = await MessSubscription.findOne({ studentId: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'planId', select: 'name durationInDays price' })
      .lean();

    let messCurrentStatus = 'none';
    if (messSubscription) {
      if (messSubscription.refund?.requested && !messSubscription.refund?.approved) {
        messCurrentStatus = 'requested';
      } else if (messSubscription.status === 'cancelled' || messSubscription.status === 'refund_approved') {
        messCurrentStatus = 'refunded';
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
    const vacateRequest = await VacateRequest.findOne({ studentId: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'processedBy', select: 'name role' })
      .lean();

    let roommates = [];
    if (allocation) {
      const roomId = allocation.roomId?._id || allocation.roomId;
      const roomAllocations = await RoomAllocation.find({ roomId, status: 'active' }).populate({ path: 'studentId', select: 'name email course studyYear enrollmentNo' }).lean();
      roommates = roomAllocations
        .filter((item) => item.studentId._id.toString() !== user._id.toString())
        .map((item) => ({
          id: item._id,
          name: item.studentId.name,
          email: item.studentId.email,
          enrollmentNo: item.studentId.enrollmentNo,
          course: item.studentId.course || '',
          studyYear: item.studentId.studyYear || null,
          initials: item.studentId.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2),
        }));
    }

    const room = allocation
      ? {
        allocationId: allocation._id,
        roomNumber: allocation.roomId?.roomNumber || null,
        roomType: allocation.roomId?.roomType || null,
        capacity: allocation.roomId?.capacity || null,
        status: allocation.roomId?.status || null,
        price: Number(allocation.roomId?.price || 0),
        hostelName: allocation.hostelId?.name || null,
        hostelType: allocation.hostelId?.type || null,
        moveInDate: allocation.allocatedAt || null,
      }
      : null;

    const renewal = allocation
      ? getRenewalInfoFromAllocation({
        allocation,
        roomPrice: allocation.roomId?.price,
      })
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
        course: user.course,
        studyYear: user.studyYear,
      },
      room,
      renewal,
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