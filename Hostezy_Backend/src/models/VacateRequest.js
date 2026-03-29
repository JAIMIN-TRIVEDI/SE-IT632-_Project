import mongoose from "mongoose";

const vacateSchema = new mongoose.Schema({

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  roomId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room"
  },

  reason:String,

  status:{
    type:String,
    enum:["pending","approved","rejected"],
    default:"pending"
  }

},{timestamps:true});

export default mongoose.model("VacateRequest",vacateSchema);