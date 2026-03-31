import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
        required: true
    },
    totalRooms: {
        type: Number,
        required: true,
        min: 0
    },
    occupiedRooms: {
        type: Number,
        min: 0,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Block", BlockSchema);