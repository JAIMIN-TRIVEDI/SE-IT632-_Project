import VacateRequest from "../models/VacateRequest.js";
import RoomAllocation from "../models/RoomAllocation.js";
import Room from "../models/Room.js";
import Hostel from "../models/Hostel.js";
import Notification from "../models/Notification.js";

export const requestVacate = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Reason is required." });
    }

    const allocation = await RoomAllocation.findOne({
      studentId: req.user._id,
      status: "active",
    }).lean();

    if (!allocation) {
      return res.status(400).json({ message: "No active room allocation found." });
    }

    const existingPending = await VacateRequest.findOne({
      studentId: req.user._id,
      status: "pending",
    }).lean();

    if (existingPending) {
      return res.status(400).json({ message: "You already have a pending vacate request." });
    }

    const createdRequest = await VacateRequest.create({
      studentId: req.user._id,
      roomId: allocation.roomId,
      hostelId: allocation.hostelId,
      allocationId: allocation._id,
      reason: String(reason).trim(),
      status: "pending",
    });

    const hostel = await Hostel.findById(allocation.hostelId).select("createdBy").lean();

    if (hostel?.createdBy) {
      await Notification.create({
        userId: hostel.createdBy,
        type: "vacate_request",
        message: `${req.user.name} submitted a vacate request for approval.`,
      });
    }

    const populated = await VacateRequest.findById(createdRequest._id)
      .populate({ path: "roomId", select: "roomNumber status" })
      .populate({ path: "hostelId", select: "name type" })
      .populate({ path: "studentId", select: "name email enrollmentNo" });

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyVacateRequest = async (req, res) => {
  try {
    const request = await VacateRequest.findOne({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "roomId", select: "roomNumber status" })
      .populate({ path: "hostelId", select: "name type" })
      .populate({ path: "processedBy", select: "name role" })
      .lean();

    return res.json({ success: true, data: request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getHostelAdminVacateRequests = async (req, res) => {
  try {
    const hostels = await Hostel.find({ createdBy: req.user._id }).select("_id").lean();
    const hostelIds = hostels.map((h) => h._id);

    if (!hostelIds.length) {
      return res.json({ success: true, data: [] });
    }

    const requests = await VacateRequest.find({ hostelId: { $in: hostelIds } })
      .sort({ createdAt: -1 })
      .populate({ path: "studentId", select: "name email enrollmentNo" })
      .populate({ path: "roomId", select: "roomNumber" })
      .populate({ path: "hostelId", select: "name type" })
      .populate({ path: "processedBy", select: "name role" })
      .lean();

    return res.json({ success: true, data: requests });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const approveVacate = async (req, res) => {
  try {
    const request = await VacateRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Vacate request not found." });
    }

    const managedHostel = await Hostel.findOne({
      _id: request.hostelId,
      createdBy: req.user._id,
    }).lean();

    if (!managedHostel) {
      return res.status(403).json({ message: "You are not authorized to approve this request." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}.` });
    }

    request.status = "approved";
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    const allocation = await RoomAllocation.findById(request.allocationId);
    if (allocation && allocation.status !== "vacated") {
      allocation.status = "vacated";
      allocation.vacatedAt = new Date();
      await allocation.save();
    }

    const room = await Room.findById(request.roomId);
    if (room) {
      room.occupiedCount = Math.max((room.occupiedCount || 0) - 1, 0);
      if (room.status !== "maintenance" && room.occupiedCount < room.capacity) {
        room.status = "available";
      }
      await room.save();
    }

    await Notification.create({
      userId: request.studentId,
      type: "vacate_request",
      message: "Your vacate request has been approved. Your room has been marked as vacated.",
    });

    return res.json({ success: true, message: "Vacate request approved and room released." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rejectVacate = async (req, res) => {
  try {
    const request = await VacateRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Vacate request not found." });
    }

    const managedHostel = await Hostel.findOne({
      _id: request.hostelId,
      createdBy: req.user._id,
    }).lean();

    if (!managedHostel) {
      return res.status(403).json({ message: "You are not authorized to reject this request." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}.` });
    }

    request.status = "rejected";
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    await Notification.create({
      userId: request.studentId,
      type: "vacate_request",
      message: "Your vacate request was rejected. Please contact hostel administration for details.",
    });

    return res.json({ success: true, message: "Vacate request rejected." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};