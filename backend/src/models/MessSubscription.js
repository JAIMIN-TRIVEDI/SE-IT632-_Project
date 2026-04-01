import mongoose from "mongoose";

const MessSubscriptionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MessPlan",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled", "refund_pending", "refund_approved"],
    default: "active"
  },
  refund: {
    requested: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    amount: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model("MessSubscription", MessSubscriptionSchema);