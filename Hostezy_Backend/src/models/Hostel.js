import mongoose from "mongoose";

const HostelSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },

    type : {
        type : String,
        required : true,
        enum : [
            "girl", "boy"
        ]
    },
    
}, {timestamps : true});

export default mongoose.model("Hostel",HostelSchema);