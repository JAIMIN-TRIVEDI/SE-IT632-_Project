import Room from "../models/Room.js";
import User from "../models/User.js";

export const createRoom = async(req,res)=>{

  try{

    const room = await Room.create({
      ...req.body,
      hostelId:req.params.id
    });

    res.status(201).json({
      success:true,
      data:room
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const getRoom = async(req,res)=>{

  try{

    const room = await Room.findById(req.params.id)
    .populate("occupants","name email enrollmentNo");

    if(!room){
      return res.status(404).json({message:"Room not found"});
    }

    res.json({
      success:true,
      data:room
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const allocateRoom = async(req,res)=>{

  try{

    const {studentId} = req.body;

    const room = await Room.findById(req.params.id);

    if(!room){
      return res.status(404).json({message:"Room not found"});
    }

    if(room.occupied >= room.capacity){
      return res.status(400).json({message:"Room full"});
    }

    const student = await User.findById(studentId);

    if(!student){
      return res.status(404).json({message:"Student not found"});
    }

    room.occupants.push(studentId);
    room.occupied += 1;

    if(room.occupied >= room.capacity){
      room.isAvailable = false;
    }

    await room.save();

    student.roomId = room._id;
    student.hostelId = room.hostelId;

    await student.save();

    res.json({
      success:true,
      message:"Room allocated"
    });

  }catch(err){

    res.status(500).json({message:err.message});

  }

};

export const updateRoom = async (req, res) => {

  try {

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: room
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const deleteRoom = async (req, res) => {

  try {

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Room deleted"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

export const vacateRoom = async (req, res) => {

  try {

    const room = await Room.findById(req.params.id);

    const studentId = req.body.studentId;

    room.occupants = room.occupants.filter(
      id => id.toString() !== studentId
    );

    room.occupied -= 1;
    room.isAvailable = true;

    await room.save();

    await User.findByIdAndUpdate(studentId, {
      roomId: null,
      hostelId: null
    });

    res.json({
      success: true,
      message: "Room vacated"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};