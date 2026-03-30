import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  amount:{
    type:Number,
    required:true
  },

  currency:{
    type:String,
    default:"INR"
  },

  orderId:String,
  paymentId:String,

  status:{
    type:String,
    enum:["created","paid","failed","refunded"],
    default:"created"
  },

  purpose:{
    type:String,
    enum:["mess_subscription","hostel_fee","other"],
    required:true
  },

  subscriptionId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"MessSubscription"
  }

},{timestamps:true});

export default mongoose.model("Payment",paymentSchema);