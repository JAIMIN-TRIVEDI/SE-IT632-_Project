import User from "../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  forgotPasswordService,
  resetPasswordService,
  updateProfileService,
} from "../services/authService.js";

const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

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
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await forgotPasswordService(email);
  return sendSuccess(res, 200, "OTP sent to email", null);
});

/* ── RESET PASSWORD ───────────────────────────────────────────────────────── */
export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService(req.body);
  return sendSuccess(res, 200, "Password reset successful", null);
});

/* ── GET ME ───────────────────────────────────────────────────────────────── */
export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "User fetched successfully", req.user);
});

/* ── LOGOUT ───────────────────────────────────────────────────────────────── */
export const logout = async (req, res) => {
  clearAuthCookies(res);
  return sendSuccess(res, 200, "Logged out", null);
};

/* ── UPDATE PROFILE (supports emergency contact fields) ───────────────────── */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body);
  return sendSuccess(res, 200, "Profile updated successfully", user);
});