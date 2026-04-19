import express from "express";
import { wardenDashboard } from "../controllers/reportController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
    "/warden/dashboard",
    protect,
    authorizeRoles("warden"),
    wardenDashboard,
);

export default router;
