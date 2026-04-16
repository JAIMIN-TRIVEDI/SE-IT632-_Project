import express from "express";
import {
registerUser,
loginUser,
getMe,
logout,
refreshToken,
} from "../controllers/authController.js";

import {protect} from "../middlewares/authMiddleware.js";
import {updateProfile} from "../controllers/authController.js";
import {forgotPassword, resetPassword} from "../controllers/authController.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/refresh", refreshToken);
router.get("/me",protect,getMe);
router.post("/logout",logout);
router.put("/me", protect, updateProfile);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);

export default router;