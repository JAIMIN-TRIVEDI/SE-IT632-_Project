import mongoose from "mongoose";

const RoomRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    roomType: {
        type: String,
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    requestMode: {
        type: String,
        enum: ["random", "specific"],
        default: "random"
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviewedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("RoomRequest", RoomRequestSchema);