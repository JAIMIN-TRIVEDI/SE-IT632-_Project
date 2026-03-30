import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },

  role:{
    type:String,
    enum:["student","warden","hostel_admin","mess_admin"],
    default:"student"
  },

  enrollmentNo:String,

  phone:String,

  hostelId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Hostel"
  },

  roomId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Room"
  },

  resetPasswordToken:String,
  
  resetPasswordExpire:Date

},{timestamps:true});

userSchema.pre("save", async function(){

  if(!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt);

});

userSchema.methods.comparePassword = async function(password){

  return bcrypt.compare(password,this.password);

};

export default mongoose.model("User",userSchema);