import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || "1m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "2m";

const generateAccessToken = (id) =>
  jwt.sign({ id, type: "access" }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = (id) =>
  jwt.sign({ id, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

const getTokenExpiresAt = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.exp ? decoded.exp * 1000 : Date.now();
};

const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: maxAgeMs,
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, getCookieOptions(Math.max(getTokenExpiresAt(accessToken) - Date.now(), 0)));
  res.cookie("refreshToken", refreshToken, getCookieOptions(Math.max(getTokenExpiresAt(refreshToken) - Date.now(), 0)));
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", getCookieOptions(0));
  res.clearCookie("refreshToken", getCookieOptions(0));
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  gender: user.gender,
  enrollmentNo: user.enrollmentNo,
});

/* ── REGISTER ─────────────────────────────────────────────────────────────── */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, enrollmentNo, phone, gender, role } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!gender) return res.status(400).json({ message: "Gender is required for registration." });

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const user = await User.create({ name, email, password, enrollmentNo, phone, gender, role: role || "student" });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      token: accessToken,
      user: sanitizeUser(user),
      sessionExpiresAt: getTokenExpiresAt(refreshToken),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── LOGIN ────────────────────────────────────────────────────────────────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      token: accessToken,
      user: sanitizeUser(user),
      sessionExpiresAt: getTokenExpiresAt(refreshToken),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── REFRESH ACCESS TOKEN ─────────────────────────────────────────────────── */
export const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );

    if (decoded.type && decoded.type !== "refresh") {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      token: newAccessToken,
      user: sanitizeUser(user),
      sessionExpiresAt: getTokenExpiresAt(newRefreshToken),
    });
  } catch (err) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

/* ── FORGOT PASSWORD ──────────────────────────────────────────────────────── */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, "Hostezy Password Reset OTP", `Your OTP is ${otp}. It will expire in 10 minutes.`);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── RESET PASSWORD ───────────────────────────────────────────────────────── */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await User.findOne({ email, resetPasswordOTP: hashedOTP, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* ── GET ME ───────────────────────────────────────────────────────────────── */
export const getMe = async (req, res) => {
  res.json(req.user);
};

/* ── LOGOUT ───────────────────────────────────────────────────────────────── */
export const logout = async (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, message: "Logged out" });
};

/* ── UPDATE PROFILE (supports emergency contact fields) ───────────────────── */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Basic fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.enrollmentNo !== undefined) user.enrollmentNo = req.body.enrollmentNo;

    // Emergency contact fields — stored on User model
    if (req.body.emergencyName !== undefined) user.emergencyName = req.body.emergencyName;
    if (req.body.emergencyRelationship !== undefined) user.emergencyRelationship = req.body.emergencyRelationship;
    if (req.body.emergencyPhone !== undefined) user.emergencyPhone = req.body.emergencyPhone;
    if (req.body.emergencyAddress !== undefined) user.emergencyAddress = req.body.emergencyAddress;

    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};