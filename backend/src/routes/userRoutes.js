import express from "express";
import { getProfile } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

// router.get("/dashboard", protect, (req, res) => {
//   res.json({
//     success: true,
//     user: req.user
//   });
// });

router.get("/student/dashboard", protect, async (req, res) => {
  try {
    const user = req.user;

    // Example: fetch related data (you can expand later)
    const dashboardData = {
      user,
      room: null, // TODO: fetch from Room model
      payments: [],
      notifications: []
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin only example
router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default router;