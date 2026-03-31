import express from "express";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  subscribePlan,
  getMySubscription,
  cancelSubscription,
  getMenu,
  updateMenu,
} from "../controllers/messController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import { renewSubscription } from "../controllers/messController.js";

const router = express.Router();

router.get("/mess/plans", protect, getPlans);

router.post("/mess/plans", protect, authorizeRoles("mess_admin"), createPlan);

router.put(
  "/mess/plans/:id",
  protect,
  authorizeRoles("mess_admin"),
  updatePlan,
);

router.delete(
  "/mess/plans/:id",
  protect,
  authorizeRoles("mess_admin"),
  deletePlan,
);

router.post(
  "/mess/subscribe",
  protect,
  authorizeRoles("student"),
  subscribePlan,
);

router.get(
  "/mess/subscription/me",
  protect,
  authorizeRoles("student"),
  getMySubscription,
);

router.post(
  "/mess/subscription/cancel",
  protect,
  authorizeRoles("student"),
  cancelSubscription,
);

router.get("/mess/menu", protect, getMenu);

router.put("/mess/menu", protect, authorizeRoles("mess_admin"), updateMenu);


router.post(
  "/mess/subscription/renew",
  protect,
  authorizeRoles("student"),
  renewSubscription,
);

export default router;
