import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["hostel", "mess"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);