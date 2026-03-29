import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  date:{
    type:Date,
    required:true
  },

  mealType:{
    type:String,
    enum:["breakfast","lunch","dinner"]
  },

  attendanceStatus:{
    type:String,
    enum:["present","absent"],
    default:"present"
  }

},{timestamps:true});

export default mongoose.model("MessAttendance",attendanceSchema);