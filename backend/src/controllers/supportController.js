import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import sendEmail from "../utils/sendEmail.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const canUseEmailService = () =>
    Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getSupportRecipient = () =>
    process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

export const submitSupportMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message, topic } = req.body || {};

    if (!name || !email || !subject || !message) {
        throw new AppError(
            "Name, email, subject, and message are required.",
            400,
        );
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new AppError("Please provide a valid email address.", 400);
    }

    const recipient = getSupportRecipient();
    const normalizedTopic = topic || "general";
    const mailSubject = `[Hostezy Support - ${normalizedTopic}] ${subject}`;
    const mailText = [
        `Support request received from website form`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${normalizedTopic}`,
        `Subject: ${subject}`,
        ``,
        `Message:`,
        message,
    ].join("\n");

    let delivered = false;

    if (recipient && canUseEmailService()) {
        await sendEmail(recipient, mailSubject, mailText);
        delivered = true;
    } else {
        console.warn("[Support] Email service not configured. Message logged.", {
            name,
            email,
            subject,
            topic: normalizedTopic,
        });
    }

    return sendSuccess(
        res,
        200,
        delivered
            ? "Your message has been sent successfully."
            : "Your message has been recorded. Email delivery is currently unavailable.",
        { delivered },
    );
});

export const subscribeToNewsletter = asyncHandler(async (req, res) => {
    const { email } = req.body || {};

    if (!email) {
        throw new AppError("Email is required.", 400);
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new AppError("Please provide a valid email address.", 400);
    }

    const recipient = getSupportRecipient();
    const mailSubject = "[Hostezy] Newsletter subscription request";
    const mailText = `A new user subscribed from footer.\n\nEmail: ${email}`;

    let delivered = false;

    if (recipient && canUseEmailService()) {
        await sendEmail(recipient, mailSubject, mailText);
        delivered = true;
    } else {
        console.warn("[Support] Email service not configured. Subscriber logged.", {
            email,
        });
    }

    return sendSuccess(
        res,
        200,
        delivered
            ? "Subscribed successfully."
            : "Subscription saved. Email delivery is currently unavailable.",
        { delivered },
    );
});
