import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true
  },
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Block",
    required: true
  },
  roomType: {
    type: String,
    enum: ["double", "triple", "quad"],
    default: "triple"
  },
  price: {
    type: Number,
    default: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  occupiedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["available", "full", "maintenance"],
    default: "available"
  }
}, { timestamps: true });

export default mongoose.model("Room", RoomSchema);