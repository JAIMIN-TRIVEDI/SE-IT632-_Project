import mongoose from "mongoose";

const HostelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true,
        enum: [
            "girls", "boys"
        ]
    },

}, { timestamps: true });

export default mongoose.model("Hostel", HostelSchema);
