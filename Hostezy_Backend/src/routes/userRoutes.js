import express from "express";
import { getProfile } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

// Admin only example
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
    res.json({ message: "Welcome Admin" });
});

export default router;