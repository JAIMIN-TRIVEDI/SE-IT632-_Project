import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  planId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"MessPlan",
    required:true
  },

  startDate:{
    type:Date,
    required:true
  },

  endDate:{
    type:Date,
    required:true
  },

  status:{
    type:String,
    enum:["pending_payment","active","expired","cancelled"],
    default:"pending_payment"
  },

  paymentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Payment"
  },

  reminderSent:{
    type:Boolean,
    default:false
  }

},{timestamps:true});

export default mongoose.model("MessSubscription",subscriptionSchema);