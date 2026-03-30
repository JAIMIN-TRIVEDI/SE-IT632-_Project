import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({

  title:{
    type:String,
    required:true
  },

  description:{
    type:String,
    required:true
  },

  category:{
    type:String,
    enum:["electrical","plumbing","cleanliness","furniture","other"],
    required:true
  },

  priority:{
    type:String,
    enum:["low","medium","high"],
    default:"medium"
  },

  status:{
    type:String,
    enum:["pending","in_progress","resolved","rejected"],
    default:"pending"
  },

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  hostelId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Hostel"
  },

  roomId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room"
  },

  remark:String,

  resolvedAt:Date

},{timestamps:true});

export default mongoose.model("Complaint",complaintSchema);