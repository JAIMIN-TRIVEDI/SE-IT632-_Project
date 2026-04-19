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

MessSubscriptionSchema.index({ status: 1, endDate: -1, createdAt: -1 });
MessSubscriptionSchema.index({ "refund.requested": 1, "refund.approved": 1, createdAt: -1 });
MessSubscriptionSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model("MessSubscription", MessSubscriptionSchema);