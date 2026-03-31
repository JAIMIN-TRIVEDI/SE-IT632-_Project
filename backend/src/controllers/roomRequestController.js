import Room from "../models/Room.js";
import RoomRequest from "../models/RoomRequest.js";
import RoomAllocation from "../models/RoomAllocation.js";
import Hostel from "../models/Hostel.js";

export const getAvailableRooms = async (req, res) => {
    try {
        const userGender = req.user.gender?.toLowerCase();
        if (!userGender || !["male", "female"].includes(userGender)) {
            return res.status(400).json({ message: "User gender is required to select hostel." });
        }

        const hostelType = userGender === "male" ? "boy" : "girl";
        const hostels = await Hostel.find({ type: hostelType }).select("_id");

        if (!hostels.length) {
            return res.status(404).json({ message: `No ${hostelType} hostels available.` });
        }

        const hostelIds = hostels.map((hostel) => hostel._id);
        const rooms = await Room.find({ status: "available", hostelId: { $in: hostelIds } }).populate({
            path: "hostelId",
            select: "name type",
        });

        res.json({
            success: true,
            data: rooms,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMyRoomRequest = async (req, res) => {
    try {
        const request = await RoomRequest.findOne({ studentId: req.user._id })
            .sort({ createdAt: -1 })
            .populate({ path: "roomId", select: "roomNumber roomType price status hostelId" })
            .populate({ path: "hostelId", select: "name type" });

        res.json({
            success: true,
            data: request,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createRoomRequest = async (req, res) => {
    try {
        const { roomType } = req.body;

        if (!roomType) {
            return res.status(400).json({ message: "Please select a room type." });
        }

        const activeAllocation = await RoomAllocation.findOne({ studentId: req.user._id, status: "active" });
        if (activeAllocation) {
            return res.status(400).json({ message: "You already have an assigned room." });
        }

        const existingPending = await RoomRequest.findOne({ studentId: req.user._id, status: "pending" });
        if (existingPending) {
            return res.status(400).json({ message: "You already have a pending room request." });
        }

        const normalizedRoomType = roomType.toLowerCase();

        const userGender = req.user.gender?.toLowerCase();
        if (!userGender || !["male", "female"].includes(userGender)) {
            return res.status(400).json({ message: "User gender is required to select hostel." });
        }

        const hostelType = userGender === "male" ? "boy" : "girl";
        const hostels = await Hostel.find({ type: hostelType }).select("_id");

        if (!hostels.length) {
            return res.status(404).json({ message: `No ${hostelType} hostels available.` });
        }

        const hostelIds = hostels.map((hostel) => hostel._id);

        const room = await Room.findOne({
            roomType: { $regex: new RegExp(`^${normalizedRoomType}$`, 'i') },
            status: "available",
            hostelId: { $in: hostelIds },
        }).sort({ createdAt: 1 });

        if (!room) {
            return res.status(404).json({ message: `No available ${roomType} rooms available in your gender-specific hostels right now.` });
        }

        const pricing = {
            double: 30000,
            triple: 35000,
            quad: 40000,
        };
        const amount = pricing[normalizedRoomType] ?? room.price ?? 35000;

        const request = await RoomRequest.create({
            studentId: req.user._id,
            hostelId: room.hostelId,
            roomId: room._id,
            roomType: normalizedRoomType,
            amount,
        });

        const populatedRequest = await RoomRequest.findById(request._id)
            .populate({ path: "roomId", select: "roomNumber roomType price status hostelId" })
            .populate({ path: "hostelId", select: "name type" });

        res.status(201).json({
            success: true,
            data: populatedRequest,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
