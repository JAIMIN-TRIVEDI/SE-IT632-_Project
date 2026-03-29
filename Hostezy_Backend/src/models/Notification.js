import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  title:{
    type:String,
    required:true
  },

  message:{
    type:String,
    required:true
  },

  type:{
    type:String,
    enum:["system","payment","complaint","mess","hostel"]
  },

  isRead:{
    type:Boolean,
    default:false
  }

},{timestamps:true});

export default mongoose.model("Notification",notificationSchema);