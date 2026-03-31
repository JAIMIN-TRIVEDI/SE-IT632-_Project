import Room from "../models/Room.js";
import RoomRequest from "../models/RoomRequest.js";
import RoomAllocation from "../models/RoomAllocation.js";
import Hostel from "../models/Hostel.js";
import Block from "../models/Block.js";
import User from "../models/User.js";

const getStudentGender = async (userId) => {
    const student = await User.findById(userId).select("gender").lean();
    return student?.gender?.toLowerCase();
};

export const getAvailableRooms = async (req, res) => {
    try {
        const userGender = await getStudentGender(req.user._id);

        if (!userGender || !["male", "female"].includes(userGender)) {
            return res.status(400).json({ message: "User gender is missing or invalid on your profile. Please contact admin." });
        }

        const hostelType = userGender === "male" ? "boy" : "girl";
        const hostels = await Hostel.find({ type: hostelType }).select("_id");

        if (!hostels.length) {
            return res.status(404).json({ message: `No ${hostelType}s' hostels available.` });
        }

        const hostelIds = hostels.map((h) => h._id);

        const rooms = await Room.find({
            status: "available",
            hostelId: { $in: hostelIds },
            $expr: { $lt: ["$occupiedCount", "$capacity"] },
        })
            .populate({ path: "hostelId", select: "name type" })
            .populate({ path: "blockId", select: "name" })
            .sort({ blockId: 1, roomNumber: 1 });

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
        const { roomType } = req.body;

        if (!roomType) {
            return res.status(400).json({ message: "Please select a room type." });
        }

        const normalizedRoomType = roomType.trim().toLowerCase();

        // ── Step 1: Fetch student gender fresh from DB ────────────────────────
        const userGender = await getStudentGender(req.user._id);
        console.log("[RoomRequest] studentId:", req.user._id, "| gender from DB:", userGender);

        if (!userGender || !["male", "female"].includes(userGender)) {
            return res.status(400).json({ message: "User gender is missing or invalid on your profile. Please contact admin." });
        }

        // ── Step 2: Guards ────────────────────────────────────────────────────
        const activeAllocation = await RoomAllocation.findOne({ studentId: req.user._id, status: "active" });
        if (activeAllocation) {
            return res.status(400).json({ message: "You already have an assigned room." });
        }

        const existingPending = await RoomRequest.findOne({ studentId: req.user._id, status: "pending" });
        if (existingPending) {
            return res.status(400).json({ message: "You already have a pending room request." });
        }

        // ── Step 3: Find gender-appropriate hostels ───────────────────────────
        const hostelType = userGender === "male" ? "boy" : "girl";
        const hostels = await Hostel.find({ type: hostelType }).lean();
        console.log("[RoomRequest] hostelType:", hostelType, "| hostels found:", hostels.map(h => ({ id: h._id, name: h.name })));

        if (!hostels.length) {
            return res.status(404).json({ message: `No ${hostelType}s' hostels available.` });
        }

        const hostelIds = hostels.map((h) => h._id);

        // ── Step 4: Find blocks in those hostels ──────────────────────────────
        const blocks = await Block.find({ hostelId: { $in: hostelIds } }).sort({ name: 1 }).lean();
        console.log("[RoomRequest] blocks found:", blocks.map(b => ({ id: b._id, name: b.name, hostelId: b.hostelId })));

        if (!blocks.length) {
            return res.status(404).json({ message: "No blocks found in the available hostels. Please contact admin." });
        }

        // ── Step 5: Broad room search (no block filter) to verify data exists ─
        // This tells us if rooms exist at all for this hostel+type combination
        const allMatchingRooms = await Room.find({
            hostelId: { $in: hostelIds },
            roomType: { $regex: new RegExp(`^${normalizedRoomType}$`, "i") },
        }).lean();
        console.log(
            `[RoomRequest] ALL rooms in hostel with roomType="${normalizedRoomType}" (ignoring status/capacity):`,
            allMatchingRooms.map(r => ({
                id: r._id,
                roomNumber: r.roomNumber,
                roomType: r.roomType,
                status: r.status,
                blockId: r.blockId,
                hostelId: r.hostelId,
                occupiedCount: r.occupiedCount,
                capacity: r.capacity,
            }))
        );

        // ── Step 6: Block-wise search ─────────────────────────────────────────
        let selectedRoom = null;

        for (const block of blocks) {
            const room = await Room.findOne({
                blockId: block._id,
                hostelId: block.hostelId,
                roomType: { $regex: new RegExp(`^${normalizedRoomType}$`, "i") },
                status: "available",
                $expr: { $lt: ["$occupiedCount", "$capacity"] },
            })
                .sort({ roomNumber: 1 })
                .lean();

            console.log(`[RoomRequest] Block "${block.name}" (${block._id}) → room found:`, room ? room.roomNumber : "none");

            if (room) {
                selectedRoom = room;
                break;
            }
        }

        if (!selectedRoom) {
            // ── Extra diagnostic: show why each room was skipped ──────────────
            const diagnosis = allMatchingRooms.map(r => {
                const blockMatch = blocks.find(b => b._id.toString() === r.blockId?.toString());
                return {
                    roomNumber: r.roomNumber,
                    roomType: r.roomType,
                    status: r.status,
                    occupiedCount: r.occupiedCount,
                    capacity: r.capacity,
                    blockFound: !!blockMatch,
                    blockName: blockMatch?.name ?? "NO MATCHING BLOCK",
                    hostelIdOnRoom: r.hostelId?.toString(),
                    hostelIdOnBlock: blockMatch?.hostelId?.toString(),
                    hostelIdMatch: r.hostelId?.toString() === blockMatch?.hostelId?.toString(),
                };
            });
            console.log("[RoomRequest] DIAGNOSIS — why rooms were skipped:", JSON.stringify(diagnosis, null, 2));

            return res.status(404).json({
                message: `No available ${normalizedRoomType} rooms found in any block of the ${hostelType}s' hostels right now.`,
                // Return diagnosis in dev so you can see it in the API response too
                debug: diagnosis,
            });
        }

        // ── Step 7: Create request ────────────────────────────────────────────
        const pricing = { double: 30000, triple: 35000, quad: 40000 };
        const amount = pricing[normalizedRoomType] ?? selectedRoom.price ?? 35000;

        const request = await RoomRequest.create({
            studentId: req.user._id,
            hostelId: selectedRoom.hostelId,
            roomId: selectedRoom._id,
            roomType: normalizedRoomType,
            amount,
        });

        const populatedRequest = await RoomRequest.findById(request._id)
            .populate({ path: "roomId", select: "roomNumber roomType price status hostelId blockId" })
            .populate({ path: "hostelId", select: "name type" });

        return res.status(201).json({ success: true, data: populatedRequest });
    } catch (err) {
        console.error("[createRoomRequest] ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};