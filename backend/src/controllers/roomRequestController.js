import Room from "../models/Room.js";
import RoomRequest from "../models/RoomRequest.js";
import RoomAllocation from "../models/RoomAllocation.js";
import Hostel from "../models/Hostel.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { validateStudentCourseAndSemester } from "../services/academicPolicyService.js";

const DEFAULT_ROOM_PRICING = {
    double: 30000,
    triple: 35000,
    quad: 40000,
};

const getStudentGender = async (userId) => {
    const student = await User.findById(userId).select("gender").lean();
    return student?.gender?.toLowerCase();
};

const getAllowedHostelType = (gender) => (gender === "male" ? "boy" : "girl");

const getRoomPrice = (room) => {
    if (Number.isFinite(Number(room?.price)) && Number(room.price) > 0) {
        return Number(room.price);
    }
    return DEFAULT_ROOM_PRICING[room?.roomType] || DEFAULT_ROOM_PRICING.triple;
};

const hasActiveOrPendingRequest = async (studentId) => {
    return RoomRequest.findOne({
        studentId,
        $or: [
            { status: "pending" },
            { status: "approved", paymentStatus: "pending" },
        ],
    }).lean();
};

const getActiveAllocation = async (studentId) => {
    return RoomAllocation.findOne({ studentId, status: "active" }).lean();
};

const getRoomWithResidents = async ({ hostelIds, roomType }) => {
    const roomFilter = {
        hostelId: { $in: hostelIds },
        status: "available",
        $expr: { $lt: ["$occupiedCount", "$capacity"] },
    };

    if (roomType) {
        roomFilter.roomType = roomType;
    }

    const rooms = await Room.find(roomFilter)
        .populate({ path: "hostelId", select: "name type" })
        .populate({ path: "blockId", select: "name" })
        .sort({ hostelId: 1, blockId: 1, roomNumber: 1 })
        .lean();

    if (!rooms.length) {
        return [];
    }

    const roomIds = rooms.map((room) => room._id);
    const allocations = await RoomAllocation.find({ roomId: { $in: roomIds }, status: "active" })
        .populate({ path: "studentId", select: "name email enrollmentNo phone gender course studyYear" })
        .lean();

    const residentsByRoom = allocations.reduce((acc, allocation) => {
        const roomId = allocation.roomId?.toString();
        if (!roomId || !allocation.studentId) return acc;

        if (!acc[roomId]) {
            acc[roomId] = [];
        }

        acc[roomId].push({
            _id: allocation.studentId._id,
            name: allocation.studentId.name,
            email: allocation.studentId.email,
            phone: allocation.studentId.phone || "",
            enrollmentNo: allocation.studentId.enrollmentNo || "",
            gender: allocation.studentId.gender || "",
            course: allocation.studentId.course || "",
            studyYear: allocation.studentId.studyYear || null,
        });

        return acc;
    }, {});

    return rooms.map((room) => ({
        ...room,
        availableSeats: Math.max(Number(room.capacity || 0) - Number(room.occupiedCount || 0), 0),
        residents: residentsByRoom[room._id.toString()] || [],
    }));
};

export const getAvailableRooms = async (req, res) => {
    try {
        const student = await User.findById(req.user._id).select("course studyYear").lean();
        await validateStudentCourseAndSemester({
            course: student?.course,
            studyYear: student?.studyYear,
        });

        const userGender = await getStudentGender(req.user._id);

        if (!userGender || !["male", "female"].includes(userGender)) {
            return res.status(400).json({ message: "User gender is missing or invalid on your profile. Please contact admin." });
        }

        const hostelType = getAllowedHostelType(userGender);
        const hostels = await Hostel.find({ type: hostelType }).select("_id");

        if (!hostels.length) {
            return res.status(404).json({ message: `No ${hostelType}s' hostels available.` });
        }

        const hostelIds = hostels.map((h) => h._id);

        const roomType = req.query.roomType
            ? String(req.query.roomType).trim().toLowerCase()
            : undefined;

        const rooms = await getRoomWithResidents({ hostelIds, roomType });

        return res.json({ success: true, data: rooms });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const getMyRoomRequest = async (req, res) => {
    try {
        const request = await RoomRequest.findOne({ studentId: req.user._id })
            .sort({ createdAt: -1 })
            .populate({ path: "roomId", select: "roomNumber roomType price status hostelId blockId" })
            .populate({ path: "hostelId", select: "name type" });

        return res.json({ success: true, data: request });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const createRoomRequest = async (req, res) => {
    try {
        const { roomType, roomId, requestMode = "random" } = req.body;

        const student = await User.findById(req.user._id).select("course studyYear").lean();
        await validateStudentCourseAndSemester({
            course: student?.course,
            studyYear: student?.studyYear,
        });

        const normalizedRoomType = roomType ? roomType.trim().toLowerCase() : undefined;
        const normalizedMode = String(requestMode).trim().toLowerCase();
        const isSpecific = normalizedMode === "specific" || !!roomId;

        if (!isSpecific && !normalizedRoomType) {
            return res.status(400).json({ message: "Please select a room type for random request." });
        }

        const userGender = await getStudentGender(req.user._id);

        if (!userGender || !["male", "female"].includes(userGender)) {
            return res.status(400).json({ message: "User gender is missing or invalid on your profile. Please contact admin." });
        }

        const activeAllocation = await getActiveAllocation(req.user._id);
        if (activeAllocation) {
            return res.status(400).json({ message: "You already have an assigned room." });
        }

        const existingOpen = await hasActiveOrPendingRequest(req.user._id);
        if (existingOpen) {
            return res.status(400).json({ message: "You already have an active room request awaiting approval or payment." });
        }

        const hostelType = getAllowedHostelType(userGender);
        const hostels = await Hostel.find({ type: hostelType }).lean();

        if (!hostels.length) {
            return res.status(404).json({ message: `No ${hostelType}s' hostels available.` });
        }

        const hostelIds = hostels.map((h) => h._id);

        let selectedRoom = null;

        if (isSpecific) {
            selectedRoom = await Room.findOne({
                _id: roomId,
                hostelId: { $in: hostelIds },
                status: "available",
                $expr: { $lt: ["$occupiedCount", "$capacity"] },
            }).lean();

            if (!selectedRoom) {
                return res.status(400).json({
                    message: "Selected room is no longer available or not allowed for your hostel type.",
                });
            }
        } else {
            selectedRoom = await Room.findOne({
                hostelId: { $in: hostelIds },
                roomType: normalizedRoomType,
                status: "available",
                $expr: { $lt: ["$occupiedCount", "$capacity"] },
            })
                .sort({ hostelId: 1, blockId: 1, roomNumber: 1 })
                .lean();

            if (!selectedRoom) {
                return res.status(404).json({
                    message: `No available ${normalizedRoomType} rooms found in ${hostelType}s' hostels right now.`,
                });
            }
        }

        const resolvedRoomType = selectedRoom.roomType;
        const amount = getRoomPrice(selectedRoom);

        const request = await RoomRequest.create({
            studentId: req.user._id,
            hostelId: selectedRoom.hostelId,
            roomId: selectedRoom._id,
            roomType: resolvedRoomType,
            amount,
            requestMode: isSpecific ? "specific" : "random",
        });

        const hostel = hostels.find((item) => item._id.toString() === selectedRoom.hostelId.toString());
        if (hostel?.wardenId) {
            await createNotification({
                userId: hostel.wardenId,
                type: "room_request",
                message: `A new room request has been submitted for ${hostel.name}. Please review it in your dashboard.`,
            });
        }

        const populatedRequest = await RoomRequest.findById(request._id)
            .populate({ path: "roomId", select: "roomNumber roomType price status hostelId blockId" })
            .populate({ path: "hostelId", select: "name type" });

        return res.status(201).json({ success: true, data: populatedRequest });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const getWardenRoomRequests = async (req, res) => {
    try {
        const status = String(req.query.status || "pending").trim().toLowerCase();
        const query = {};

        if (status !== "all") {
            query.status = status;
        }

        const hostels = await Hostel.find({ wardenId: req.user._id }).select("_id").lean();
        const hostelIds = hostels.map((hostel) => hostel._id);

        if (!hostelIds.length) {
            return res.json({ success: true, data: [] });
        }

        const requests = await RoomRequest.find({ ...query, hostelId: { $in: hostelIds } })
            .sort({ createdAt: -1 })
            .populate({ path: "studentId", select: "name email phone enrollmentNo gender course studyYear" })
            .populate({ path: "hostelId", select: "name type" })
            .populate({ path: "roomId", select: "roomNumber roomType capacity occupiedCount status blockId" })
            .populate({ path: "reviewedBy", select: "name email" });

        return res.json({ success: true, data: requests });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const reviewRoomRequest = async (req, res) => {
    try {
        const { action, reason } = req.body;
        const normalizedAction = String(action || "").trim().toLowerCase();

        if (!["approve", "reject"].includes(normalizedAction)) {
            return res.status(400).json({ message: "Action must be approve or reject." });
        }

        const roomRequest = await RoomRequest.findById(req.params.id)
            .populate({ path: "hostelId", select: "name wardenId" })
            .populate({ path: "roomId", select: "status occupiedCount capacity roomNumber roomType" });

        if (!roomRequest) {
            return res.status(404).json({ message: "Room request not found." });
        }

        if (roomRequest.hostelId?.wardenId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to review this request." });
        }

        if (roomRequest.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be reviewed." });
        }

        if (normalizedAction === "approve") {
            const room = roomRequest.roomId;
            const isAvailable =
                room && room.status === "available" && Number(room.occupiedCount || 0) < Number(room.capacity || 0);

            if (!isAvailable) {
                return res.status(400).json({
                    message: "This room is no longer available. Please reject this request and ask the student to submit a new one.",
                });
            }

            roomRequest.status = "approved";
            roomRequest.reviewedBy = req.user._id;
            roomRequest.reviewedAt = new Date();
            roomRequest.rejectionReason = "";

            await roomRequest.save();

            await createNotification({
                userId: roomRequest.studentId,
                type: "room_request_approved",
                message: `Your room request for Room ${room.roomNumber} in ${roomRequest.hostelId?.name || "your hostel"} has been approved. Please complete the payment to confirm allocation.`,
            });
        } else {
            roomRequest.status = "rejected";
            roomRequest.reviewedBy = req.user._id;
            roomRequest.reviewedAt = new Date();
            roomRequest.rejectionReason = reason ? String(reason).trim() : "";

            await roomRequest.save();

            await createNotification({
                userId: roomRequest.studentId,
                type: "room_request_rejected",
                message: `Your room request has been rejected${roomRequest.rejectionReason ? `: ${roomRequest.rejectionReason}` : "."}`,
            });
        }

        const refreshed = await RoomRequest.findById(roomRequest._id)
            .populate({ path: "studentId", select: "name email phone enrollmentNo gender course studyYear" })
            .populate({ path: "hostelId", select: "name type" })
            .populate({ path: "roomId", select: "roomNumber roomType capacity occupiedCount status blockId" })
            .populate({ path: "reviewedBy", select: "name email" });

        return res.json({ success: true, data: refreshed });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};