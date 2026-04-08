import Hostel from "../models/Hostel.js";
import Block from "../models/Block.js";
import Room from "../models/Room.js";
import RoomAllocation from "../models/RoomAllocation.js";
import RoomRequest from "../models/RoomRequest.js";
import Notification from "../models/Notification.js";

const ROOM_TYPES = new Set(["double", "triple", "quad"]);
const ROOM_STATUSES = new Set(["available", "full", "maintenance"]);

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

const populateHostelRelations = (query) =>
  query
    .populate("wardenId", "name email")
    .populate("createdBy", "name email");

const attachBlocksAndRooms = async (hostelDocs) => {
  const docs = Array.isArray(hostelDocs) ? hostelDocs : [hostelDocs];
  if (docs.length === 0) return [];

  const hostels = docs.map((doc) => (doc?.toObject ? doc.toObject() : doc));
  const hostelIds = hostels.map((hostel) => hostel._id);

  const [blocks, rooms] = await Promise.all([
    Block.find({ hostelId: { $in: hostelIds } }).sort({ name: 1 }).lean(),
    Room.find({ hostelId: { $in: hostelIds } }).sort({ roomNumber: 1 }).lean(),
  ]);

  const roomsByBlock = new Map();
  const roomsByHostel = new Map();

  for (const room of rooms) {
    const blockKey = room.blockId?.toString();
    const hostelKey = room.hostelId?.toString();

    if (blockKey) {
      const blockRooms = roomsByBlock.get(blockKey) || [];
      blockRooms.push(room);
      roomsByBlock.set(blockKey, blockRooms);
    }

    if (hostelKey) {
      const hostelRooms = roomsByHostel.get(hostelKey) || [];
      hostelRooms.push(room);
      roomsByHostel.set(hostelKey, hostelRooms);
    }
  }

  const blocksByHostel = new Map();

  for (const block of blocks) {
    const hostelKey = block.hostelId?.toString();
    const blockKey = block._id?.toString();
    const blockWithRooms = {
      ...block,
      rooms: blockKey ? (roomsByBlock.get(blockKey) || []) : [],
    };

    const hostelBlocks = blocksByHostel.get(hostelKey) || [];
    hostelBlocks.push(blockWithRooms);
    blocksByHostel.set(hostelKey, hostelBlocks);
  }

  return hostels.map((hostel) => {
    const hostelKey = hostel._id?.toString();
    const hostelBlocks = blocksByHostel.get(hostelKey) || [];
    const hostelRooms = roomsByHostel.get(hostelKey) || [];

    const configuredRooms = hostelBlocks.reduce(
      (acc, block) => acc + Number(block.totalRooms || 0),
      0
    );

    const occupiedRoomsFromBlocks = hostelBlocks.reduce(
      (acc, block) => acc + Number(block.occupiedRooms || 0),
      0
    );

    const roomsByStatus = hostelRooms.reduce(
      (acc, room) => {
        const status = room.status || "available";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { available: 0, full: 0, maintenance: 0 }
    );

    const roomsByType = hostelRooms.reduce(
      (acc, room) => {
        const roomType = room.roomType || "triple";
        acc[roomType] = (acc[roomType] || 0) + 1;
        return acc;
      },
      { double: 0, triple: 0, quad: 0 }
    );

    const totalActualRooms = hostelRooms.length;
    const hasRoomRecords = totalActualRooms > 0;

    const totalRooms = hasRoomRecords ? totalActualRooms : configuredRooms;
    const occupiedRooms = hasRoomRecords
      ? Number(roomsByStatus.full || 0)
      : occupiedRoomsFromBlocks;
    const availableRooms = hasRoomRecords
      ? Number(roomsByStatus.available || 0)
      : Math.max(configuredRooms - occupiedRoomsFromBlocks, 0);

    const totalCapacity = hostelRooms.reduce(
      (acc, room) => acc + Number(room.capacity || 0),
      0
    );

    return {
      ...hostel,
      blocks: hostelBlocks,
      rooms: hostelRooms,
      totalBlocks: hostelBlocks.length,
      totalRooms,
      availableRooms,
      stats: {
        totalBlocks: hostelBlocks.length,
        totalRooms,
        totalConfiguredRooms: configuredRooms,
        availableRooms,
        occupiedRooms,
        totalCapacity,
        occupiedCount: occupiedRooms,
        fullRooms: roomsByStatus.full,
        maintenanceRooms: roomsByStatus.maintenance,
        roomsByStatus,
        roomsByType,
      },
    };
  });
};

const applyWardenHostelFilter = (query, user) => {
  if (user?.role === "warden") {
    return query.where("wardenId").equals(user._id);
  }
  return query;
};

const normalizeBlocksInput = (blocksInput) => {
  if (!Array.isArray(blocksInput)) return [];

  return blocksInput.map((block) => {
    const name = typeof block?.name === "string" ? block.name.trim() : "";
    const totalRooms = Number(block?.totalRooms ?? 0);

    if (!name) {
      throw new ValidationError("Each block must have a valid name.");
    }

    if (!Number.isInteger(totalRooms) || totalRooms < 0) {
      throw new ValidationError(`Block \"${name}\" must have a valid total room count.`);
    }

    const roomsInput = Array.isArray(block?.rooms) ? block.rooms : [];
    const roomNumberSet = new Set();

    const rooms = roomsInput.map((room, index) => {
      const roomNumber = typeof room?.roomNumber === "string" ? room.roomNumber.trim() : "";

      if (!roomNumber) {
        throw new ValidationError(
          `Block \"${name}\" has an invalid room number at item ${index + 1}.`
        );
      }

      if (roomNumberSet.has(roomNumber)) {
        throw new ValidationError(
          `Block \"${name}\" contains duplicate room number \"${roomNumber}\".`
        );
      }

      roomNumberSet.add(roomNumber);

      const normalizedRoomType = typeof room?.roomType === "string" ? room.roomType.toLowerCase() : "";
      const roomType = ROOM_TYPES.has(normalizedRoomType) ? normalizedRoomType : "triple";

      const fallbackCapacity = roomType === "double" ? 2 : roomType === "quad" ? 4 : 3;
      const parsedCapacity = Number(room?.capacity);
      const capacity = Number.isFinite(parsedCapacity) && parsedCapacity > 0
        ? Math.floor(parsedCapacity)
        : fallbackCapacity;

      const parsedPrice = Number(room?.price);
      const price = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;

      const normalizedStatus = typeof room?.status === "string" ? room.status.toLowerCase() : "";
      const status = ROOM_STATUSES.has(normalizedStatus) ? normalizedStatus : "available";

      return {
        _id: room?._id,
        roomNumber,
        roomType,
        capacity,
        price,
        status,
      };
    });

    if (rooms.length !== totalRooms) {
      const diff = totalRooms - rooms.length;
      const detail = diff > 0
        ? `Add ${diff} more room${diff === 1 ? "" : "s"}`
        : `Remove ${Math.abs(diff)} room${Math.abs(diff) === 1 ? "" : "s"}`;
      throw new ValidationError(
        `Block \"${name}\" requires exactly ${totalRooms} rooms. Currently defined: ${rooms.length}. ${detail}.`
      );
    }

    return {
      _id: block?._id,
      name,
      totalRooms,
      rooms,
    };
  });
};

const notifyAndCleanupForRemovedRooms = async ({
  hostelId,
  hostelName,
  roomDocs,
  contextLabel,
}) => {
  if (!Array.isArray(roomDocs) || roomDocs.length === 0) return;

  const roomIds = roomDocs.map((room) => room._id);
  const roomById = new Map(roomDocs.map((room) => [room._id.toString(), room]));

  const [activeAllocations, pendingRequests] = await Promise.all([
    RoomAllocation.find({ roomId: { $in: roomIds }, status: "active" })
      .select("studentId roomId")
      .lean(),
    RoomRequest.find({ roomId: { $in: roomIds }, status: "pending" })
      .select("studentId roomId")
      .lean(),
  ]);

  const affectedUsers = new Map();

  for (const allocation of activeAllocations) {
    const studentKey = allocation.studentId?.toString();
    const room = roomById.get(allocation.roomId?.toString());
    if (!studentKey || !room) continue;

    const current = affectedUsers.get(studentKey) || { allocations: [], requests: [] };
    current.allocations.push(room.roomNumber);
    affectedUsers.set(studentKey, current);
  }

  for (const request of pendingRequests) {
    const studentKey = request.studentId?.toString();
    const room = roomById.get(request.roomId?.toString());
    if (!studentKey || !room) continue;

    const current = affectedUsers.get(studentKey) || { allocations: [], requests: [] };
    current.requests.push(room.roomNumber);
    affectedUsers.set(studentKey, current);
  }

  const notifications = [];

  for (const [studentId, impact] of affectedUsers.entries()) {
    const allocationRooms = [...new Set(impact.allocations)].sort();
    const requestRooms = [...new Set(impact.requests)].sort();

    const segments = [];

    if (allocationRooms.length > 0) {
      segments.push(`your allocation in room(s): ${allocationRooms.join(", ")}`);
    }

    if (requestRooms.length > 0) {
      segments.push(`your pending request for room(s): ${requestRooms.join(", ")}`);
    }

    notifications.push({
      userId: studentId,
      type: "room_update",
      message: `Hostel admin updated ${contextLabel} in ${hostelName}. This affected ${segments.join(" and ")}. Please review available rooms and submit a new request if needed.`,
    });
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  await Promise.all([
    RoomAllocation.updateMany(
      { roomId: { $in: roomIds }, status: "active" },
      { $set: { status: "vacated", vacatedAt: new Date() } }
    ),
    RoomRequest.updateMany(
      { roomId: { $in: roomIds }, status: "pending" },
      { $set: { status: "rejected" } }
    ),
  ]);
};

const syncBlocksAndRoomsForHostel = async (hostelId, blocksInput) => {
  const normalizedBlocks = normalizeBlocksInput(blocksInput);
  const hostelDoc = await Hostel.findById(hostelId).select("name").lean();
  const hostelName = hostelDoc?.name || "your hostel";

  const allRoomNumbers = new Set();
  const incomingRoomIds = [];

  for (const block of normalizedBlocks) {
    for (const room of block.rooms) {
      if (allRoomNumbers.has(room.roomNumber)) {
        throw new ValidationError(
          `Duplicate room number \"${room.roomNumber}\" is not allowed across blocks in the same hostel.`
        );
      }
      allRoomNumbers.add(room.roomNumber);
      if (room._id) incomingRoomIds.push(room._id);
    }
  }

  if (allRoomNumbers.size > 0) {
    const duplicateRoomsInDb = await Room.find({
      hostelId,
      roomNumber: { $in: [...allRoomNumbers] },
      ...(incomingRoomIds.length > 0 ? { _id: { $nin: incomingRoomIds } } : {}),
    })
      .select("roomNumber")
      .lean();

    if (duplicateRoomsInDb.length > 0) {
      const duplicated = [...new Set(duplicateRoomsInDb.map((room) => room.roomNumber))]
        .sort()
        .join(", ");
      throw new ValidationError(
        `Room number(s) already exist in this hostel: ${duplicated}. Please use unique room numbers.`
      );
    }
  }

  const existingBlocks = await Block.find({ hostelId }).select("_id").lean();
  const incomingBlockIds = new Set(
    normalizedBlocks
      .map((block) => block._id?.toString())
      .filter(Boolean)
  );

  const blocksToDelete = existingBlocks.filter(
    (block) => !incomingBlockIds.has(block._id.toString())
  );

  if (blocksToDelete.length > 0) {
    const blockIdsToDelete = blocksToDelete.map((block) => block._id);
    const roomsToDelete = await Room.find({
      hostelId,
      blockId: { $in: blockIdsToDelete },
    })
      .select("_id roomNumber")
      .lean();

    await notifyAndCleanupForRemovedRooms({
      hostelId,
      hostelName,
      roomDocs: roomsToDelete,
      contextLabel: "block details",
    });

    await Room.deleteMany({ hostelId, blockId: { $in: blockIdsToDelete } });
    await Block.deleteMany({ hostelId, _id: { $in: blockIdsToDelete } });
  }

  if (normalizedBlocks.length === 0) return;

  for (const blockInput of normalizedBlocks) {
    let blockDoc;

    if (blockInput._id) {
      const existingBlock = await Block.findOne({ _id: blockInput._id, hostelId });
      if (existingBlock) {
        existingBlock.name = blockInput.name;
        existingBlock.totalRooms = blockInput.totalRooms;
        existingBlock.occupiedRooms = Math.min(
          Number(existingBlock.occupiedRooms || 0),
          blockInput.totalRooms
        );
        blockDoc = await existingBlock.save();
      }
    }

    if (!blockDoc) {
      blockDoc = await Block.create({
        name: blockInput.name,
        totalRooms: blockInput.totalRooms,
        hostelId,
      });
    }

    const existingRooms = await Room.find({ hostelId, blockId: blockDoc._id })
      .select("_id roomNumber")
      .lean();

    const incomingBlockRoomIds = new Set(
      blockInput.rooms
        .map((room) => room._id?.toString())
        .filter(Boolean)
    );

    const roomsToDeleteForBlock = existingRooms.filter(
      (room) => !incomingBlockRoomIds.has(room._id.toString())
    );

    if (roomsToDeleteForBlock.length > 0) {
      await notifyAndCleanupForRemovedRooms({
        hostelId,
        hostelName,
        roomDocs: roomsToDeleteForBlock,
        contextLabel: `room ranges for block ${blockDoc.name}`,
      });

      await Room.deleteMany({
        hostelId,
        blockId: blockDoc._id,
        _id: { $in: roomsToDeleteForBlock.map((room) => room._id) },
      });
    }

    for (const roomInput of blockInput.rooms) {
      const roomPayload = {
        roomNumber: roomInput.roomNumber,
        hostelId,
        blockId: blockDoc._id,
        roomType: roomInput.roomType,
        price: roomInput.price,
        capacity: roomInput.capacity,
        status: roomInput.status,
      };

      if (roomInput._id) {
        const updatedRoom = await Room.findOneAndUpdate(
          { _id: roomInput._id, hostelId, blockId: blockDoc._id },
          roomPayload,
          { new: true }
        );

        if (!updatedRoom) {
          await Room.create(roomPayload);
        }
      } else {
        await Room.create(roomPayload);
      }
    }
  }
};

export const createHostel = async(req,res)=>{

  try{

    const { name, type, wardenId, blocks } = req.body;

    const hostel = await Hostel.create({
      name,
      type,
      wardenId,
      createdBy: req.user?._id,
    });

    await syncBlocksAndRoomsForHostel(hostel._id, blocks);

    const hostelWithDetails = await attachBlocksAndRooms(
      await populateHostelRelations(Hostel.findById(hostel._id))
    );

    res.status(201).json({
      success:true,
      data:hostelWithDetails[0]
    });

  }catch(err){

    res.status(err.statusCode || 500).json({message:err.message});

  }

};

export const getHostels = async(req,res)=>{

  try{

    const hostelQuery = applyWardenHostelFilter(Hostel.find(), req.user);
    const hostels = await populateHostelRelations(hostelQuery);
    const hostelsWithDetails = await attachBlocksAndRooms(hostels);

    res.json({
      success:true,
      data:hostelsWithDetails
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const getHostelById = async(req,res)=>{

  try{

    let query = Hostel.findById(req.params.id);
    query = applyWardenHostelFilter(query, req.user);
    const hostel = await populateHostelRelations(query);

    if(!hostel){
      return res.status(404).json({message:"Hostel not found"});
    }

    const hostelWithDetails = await attachBlocksAndRooms(hostel);

    res.json({
      success:true,
      data:hostelWithDetails[0]
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const updateHostel = async (req, res) => {

  try {

    const { name, type, wardenId, blocks } = req.body;

    const updatePayload = {
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(wardenId !== undefined ? { wardenId } : {}),
    };

    const hostel = await populateHostelRelations(
      Hostel.findByIdAndUpdate(
        req.params.id,
        updatePayload,
        { new: true }
      )
    );

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    if (blocks !== undefined) {
      await syncBlocksAndRoomsForHostel(hostel._id, blocks);
    }

    const hostelWithDetails = await attachBlocksAndRooms(hostel);

    res.json({
      success: true,
      data: hostelWithDetails[0]
    });

  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }

};

export const deleteHostel = async (req, res) => {

  try {

    await Room.deleteMany({ hostelId: req.params.id });
    await Block.deleteMany({ hostelId: req.params.id });

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Hostel deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const assignWarden = async (req, res) => {
  try {

    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    hostel.wardenId = req.body.wardenId;

    await hostel.save();

    const hostelWithDetails = await attachBlocksAndRooms(
      await populateHostelRelations(Hostel.findById(hostel._id))
    );

    res.json({
      success: true,
      message: "Warden assigned successfully",
      data: hostelWithDetails[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};