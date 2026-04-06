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
    const { name, email, password, enrollmentNo, phone, gender, role } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!gender) {
      return res.status(400).json({ message: "Gender is required for registration." });
    }

    const exists = await User.findOne({ email: normalizedEmail });

    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      enrollmentNo,
      phone,
      gender,
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
    const normalizedEmail = email?.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

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
        gender: user.gender,
        enrollmentNo: user.enrollmentNo,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========7======== FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent spam
    if (user.resetPasswordExpire && user.resetPasswordExpire > Date.now()) {
      return res.status(400).json({
        message: "OTP already sent. Please wait 2 minutes"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = Date.now() + 2 * 60 * 1000;

    await user.save();

    console.log("Generated OTP:", otp); // DEBUG

    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP is ${otp}`
    );

    res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const otp = req.body.otp.trim();
    const password = req.body.password;

    console.log("====== RESET DEBUG ======");
    console.log("Email:", email);
    console.log("Entered OTP:", JSON.stringify(otp));
    console.log("OTP Length:", otp.length);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    console.log("Hashed OTP:", hashedOTP);
    console.log("DB OTP:", user.resetPasswordOTP);

    if (!user.resetPasswordOTP || !user.resetPasswordExpire) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (user.resetPasswordExpire < Date.now()) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.resetPasswordOTP !== hashedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ IMPORTANT: DO NOT HASH HERE
    user.password = password;

    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log("Password reset successful");

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    console.error(err);
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