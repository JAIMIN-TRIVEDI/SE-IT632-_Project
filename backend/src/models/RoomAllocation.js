import mongoose from "mongoose";

const RoomAllocationSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ["active", "vacated"],
        default: "active"
    },
    allocatedAt: {
        type: Date,
        default: Date.now
    },
    semesterStartDate: {
        type: Date,
        default: Date.now,
    },
    semesterEndDate: {
        type: Date,
    },
    renewalWindowStart: {
        type: Date,
    },
    renewalWindowEnd: {
        type: Date,
    },
    renewalStatus: {
        type: String,
        enum: ["not_due", "due", "paid", "overdue", "vacated"],
        default: "not_due",
    },
    lastRenewedAt: {
        type: Date,
    },
    autoVacatedReason: {
        type: String,
        default: "",
    },
    vacatedAt: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.model("RoomAllocation", RoomAllocationSchema);