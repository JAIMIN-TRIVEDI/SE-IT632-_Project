import express from "express";
import {
	forgotPassword,
	getMe,
	loginUser,
	logout,
	refreshToken,
	registerUser,
	resetPassword,
	googleLogin,
	updateProfile,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.put("/me", protect, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;