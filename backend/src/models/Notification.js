import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  notificationBatchId: {
    type: String,
    required: false,
  },
  targetType: {
    type: String,
    enum: ["all", "subscription", "users"],
    required: false,
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  targetPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MessPlan",
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Notification", NotificationSchema);