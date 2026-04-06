import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  // New fields for the redesigned form
  category: {
    type: String,
    trim: true,
    enum: ['Plumbing', 'Electrical', 'Furniture', 'Cleanliness', 'Wi-Fi / Internet', 'AC / Heating', 'Security', 'Other'],
    default: 'Other',
  },
  title: {
    type: String,
    trim: true,
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal',
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "resolved"],
    default: "pending",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  remark: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.model("Complaint", ComplaintSchema);