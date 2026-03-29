import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({

  roomNumber:{
    type:String,
    required:true
  },

  hostelId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Hostel",
    required:true
  },

  floor:{
    type:Number,
    required:true
  },

  type:{
    type:String,
    enum:["single","double","triple","quad"],
    required:true
  },

  capacity:{
    type:Number,
    required:true
  },

  occupied:{
    type:Number,
    default:0
  },

  occupants:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
  ],

  isAvailable:{
    type:Boolean,
    default:true
  }

},{timestamps:true});

export default mongoose.model("Room",roomSchema);