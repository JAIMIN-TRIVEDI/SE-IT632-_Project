import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["hostel", "mess", "room_request", "other"],
    default: "other"
  },
  amount: {
    type: Number,
    required: true
  },
  orderId: {
    type: String
  },
  paymentId: {
    type: String
  },
  purpose: {
    type: String
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomRequest"
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending", "refunded"],
    default: "pending"
  },
  failureReason: {
    type: String,
    default: ""
  },
  failedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  }
}, { timestamps: true });

PaymentSchema.index({ type: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model("Payment", PaymentSchema);