import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUserService = async (payload) => {
  const { name, email, password, enrollmentNo, phone, gender, role } = payload;
  const normalizedEmail = email?.toLowerCase();

  if (!gender) {
    throw new AppError("Gender is required for registration.", 400);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    enrollmentNo,
    phone,
    gender,
    role: role || "student",
  });

  return {
    token: generateToken(user._id),
    user,
  };
};

export const loginUserService = async (email, password) => {
  const normalizedEmail = email?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError("Invalid credentials", 400);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 400);
  }

  return {
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      enrollmentNo: user.enrollmentNo,
    },
  };
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  user.resetPasswordOTP = hashedOTP;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    user.email,
    "Hostezy Password Reset OTP",
    `Your OTP is ${otp}. It will expire in 10 minutes.`
  );
};

export const resetPasswordService = async ({ email, otp, password }) => {
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  const user = await User.findOne({
    email: email?.toLowerCase(),
    resetPasswordOTP: hashedOTP,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  user.password = password;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
};

export const updateProfileService = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;
  if (payload.enrollmentNo !== undefined) user.enrollmentNo = payload.enrollmentNo;

  if (payload.emergencyName !== undefined) user.emergencyName = payload.emergencyName;
  if (payload.emergencyRelationship !== undefined) {
    user.emergencyRelationship = payload.emergencyRelationship;
  }
  if (payload.emergencyPhone !== undefined) user.emergencyPhone = payload.emergencyPhone;
  if (payload.emergencyAddress !== undefined) user.emergencyAddress = payload.emergencyAddress;

  await user.save();
  return user;
};
