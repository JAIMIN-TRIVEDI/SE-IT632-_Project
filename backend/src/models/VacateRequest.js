import mongoose from "mongoose";

const VacateRequestSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true
  },

  allocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomAllocation",
    required: true
  },

  reason: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  processedAt: Date

}, { timestamps: true });

export default mongoose.model("VacateRequest", VacateRequestSchema);