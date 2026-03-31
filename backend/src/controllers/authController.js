import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, enrollmentNo, phone, role } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      enrollmentNo,
      phone,
      role: role || "student",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= FORGOT PASSWORD (OTP) ================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔐 Hash OTP
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // 📧 Send Email
    await sendEmail(
      user.email,
      "Hostezy Password Reset OTP",
      `Your OTP is ${otp}. It will expire in 10 minutes.`
    );

    res.json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= RESET PASSWORD (VERIFY OTP) ================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // 🔐 Hash incoming OTP
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOTP,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // ✅ Update password
    user.password = password;

    // ❌ Clear OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= OTHER ================= */
export const getMe = async (req, res) => {
  res.json(req.user);
};

export const logout = async (req, res) => {
  res.json({ message: "Logged out" });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};