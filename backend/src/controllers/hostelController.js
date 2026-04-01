import Hostel from "../models/Hostel.js";
import Block from "../models/Block.js";
import Room from "../models/Room.js";

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
    return {
      ...hostel,
      blocks: blocksByHostel.get(hostelKey) || [],
      rooms: roomsByHostel.get(hostelKey) || [],
    };
  });
};

const normalizeBlocksInput = (blocksInput) => {
  if (!Array.isArray(blocksInput)) return [];

  return blocksInput
    .map((block) => ({
      _id: block?._id,
      name: typeof block?.name === "string" ? block.name.trim() : "",
      totalRooms: Number(block?.totalRooms ?? 0),
      rooms: Array.isArray(block?.rooms) ? block.rooms : [],
    }))
    .filter((block) => block.name && Number.isFinite(block.totalRooms) && block.totalRooms >= 0);
};

const upsertBlocksAndRoomsForHostel = async (hostelId, blocksInput) => {
  const normalizedBlocks = normalizeBlocksInput(blocksInput);
  if (normalizedBlocks.length === 0) return;

  for (const blockInput of normalizedBlocks) {
    let blockDoc;

    if (blockInput._id) {
      blockDoc = await Block.findOneAndUpdate(
        { _id: blockInput._id, hostelId },
        { name: blockInput.name, totalRooms: blockInput.totalRooms },
        { new: true }
      );
    }

    if (!blockDoc) {
      blockDoc = await Block.create({
        name: blockInput.name,
        totalRooms: blockInput.totalRooms,
        hostelId,
      });
    }

    if (blockInput.rooms.length > 0) {
      for (const roomInput of blockInput.rooms) {
        const roomNumber = typeof roomInput?.roomNumber === "string" ? roomInput.roomNumber.trim() : "";
        if (!roomNumber) continue;

        const roomPayload = {
          roomNumber,
          hostelId,
          blockId: blockDoc._id,
          roomType: roomInput?.roomType || "triple",
          price: Number(roomInput?.price ?? 0),
          capacity: Number(roomInput?.capacity ?? 1),
          status: roomInput?.status || "available",
        };

        if (roomInput?._id) {
          await Room.findOneAndUpdate(
            { _id: roomInput._id, hostelId, blockId: blockDoc._id },
            roomPayload,
            { new: true }
          );
        } else {
          await Room.create(roomPayload);
        }
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

    await upsertBlocksAndRoomsForHostel(hostel._id, blocks);

    const hostelWithDetails = await attachBlocksAndRooms(
      await Hostel.findById(hostel._id).populate("wardenId", "name email")
    );

    res.status(201).json({
      success:true,
      data:hostelWithDetails[0]
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const getHostels = async(req,res)=>{

  try{

    const hostels = await Hostel.find().populate("wardenId","name email");
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

    const hostel = await Hostel.findById(req.params.id)
    .populate("wardenId","name email");

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

    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    ).populate("wardenId", "name email");

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    await upsertBlocksAndRoomsForHostel(hostel._id, blocks);

    const hostelWithDetails = await attachBlocksAndRooms(hostel);

    res.json({
      success: true,
      data: hostelWithDetails[0]
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const deleteHostel = async (req, res) => {

  try {

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
      await Hostel.findById(hostel._id).populate("wardenId", "name email")
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