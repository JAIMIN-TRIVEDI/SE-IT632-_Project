import express from "express";
import {
    submitSupportMessage,
    subscribeToNewsletter,
} from "../controllers/supportController.js";

const router = express.Router();

router.post("/contact", submitSupportMessage);
router.post("/subscribe", subscribeToNewsletter);

export default router;
