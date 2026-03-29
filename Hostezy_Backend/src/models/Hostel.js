import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  type:{
    type:String,
    enum:["boys","girls"],
    required:true
  },

  totalRooms:{
    type:Number,
    required:true
  },

  occupiedRooms:{
    type:Number,
    default:0
  },

  wardenId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  location:String

},{timestamps:true});

export default mongoose.model("Hostel",hostelSchema);