import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  enrollmentNo: { type: String, trim: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  role: { type: String, enum: ["student", "warden", "hostel_admin", "mess_admin"], required: true },
  isActive: { type: Boolean, default: true },

  // Emergency contact details
  emergencyName: { type: String, trim: true },
  emergencyRelationship: { type: String, trim: true },
  emergencyPhone: { type: String, trim: true },
  emergencyAddress: { type: String, trim: true },

  // Password reset
  resetPasswordOTP: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);