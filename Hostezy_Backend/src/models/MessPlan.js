import mongoose from "mongoose";

const messPlanSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },

  duration:{
    type:String,
    enum:["weekly","monthly"],
    required:true
  },

  price:{
    type:Number,
    required:true
  },

  meals:[
    {
      type:String,
      enum:["breakfast","lunch","dinner"]
    }
  ],

  description:String

},{timestamps:true});

export default mongoose.model("MessPlan",messPlanSchema);