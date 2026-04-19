import Notification from "../models/Notification.js";
import MessSubscription from "../models/MessSubscription.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

let notificationRealtimeEmitter = null;
const NOTIFICATION_EVENT_NAME = process.env.NOTIFICATION_SOCKET_EVENT || "new_notification";

export const registerNotificationRealtimeEmitter = (emitter) => {
  notificationRealtimeEmitter = typeof emitter === "function" ? emitter : null;
};

const emitNotificationRealtime = (payload) => {
  if (!notificationRealtimeEmitter) return;

  try {
    notificationRealtimeEmitter({
      event: NOTIFICATION_EVENT_NAME,
      payload,
    });
  } catch (err) {
    console.error("[NotificationService] Realtime emit failed:", err.message);
  }
};

export const createNotification = async ({ userId, message, type = "system" }) => {
  if (!userId || !message) {
    return null;
  }

  const notification = await Notification.create({
    userId,
    message,
    type,
  });

  emitNotificationRealtime({
    userId: String(notification.userId),
    notification,
  });

  return notification;
};

export const createNotificationsBulk = async (notifications = []) => {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  const docs = await Notification.insertMany(notifications);

  docs.forEach((notification) => {
    emitNotificationRealtime({
      userId: String(notification.userId),
      notification,
    });
  });

  return docs;
};

const sendEmailSafely = async ({ to, subject, text }) => {
  if (!to) return;

  try {
    await sendEmail(to, subject, text);
  } catch (err) {
    console.error("[NotificationService] Email send failed:", err.message);
  }
};

const createInAppAndEmailNotification = async ({ userId, type, message, subject }) => {
  const notification = await createNotification({
    userId,
    type,
    message,
  });

  const user = await User.findById(userId).select("email name").lean();
  await sendEmailSafely({
    to: user?.email,
    subject,
    text: message,
  });

  return notification;
};

export const sendPaymentSuccessNotification = async ({ userId, amount, purpose }) => {
  const amountText = Number(amount || 0).toFixed(2);
  const purposeText = purpose || "Payment";

  return createInAppAndEmailNotification({
    userId,
    type: "payment_success",
    message: `${purposeText} successful. Amount paid: INR ${amountText}.`,
    subject: "Hostezy Payment Successful",
  });
};

export const sendExpiringSubscriptionNotifications = async (daysBeforeExpiry = 3) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + daysBeforeExpiry + 1);

  const targetDate = new Date(start);
  targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);

  const subscriptions = await MessSubscription.find({
    status: "active",
    endDate: {
      $gte: start,
      $lt: end,
    },
  })
    .populate("planId", "name")
    .lean();

  let createdCount = 0;

  for (const subscription of subscriptions) {
    const planName = subscription.planId?.name || "your mess plan";
    const expiryDateText = new Date(subscription.endDate).toLocaleDateString("en-IN");
    const message = `Your subscription for ${planName} is expiring in ${daysBeforeExpiry} days on ${expiryDateText}. Please renew to continue uninterrupted service.`;

    const existing = await Notification.findOne({
      userId: subscription.studentId,
      type: "subscription_expiry",
      message,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    }).lean();

    if (existing) {
      continue;
    }

    await createInAppAndEmailNotification({
      userId: subscription.studentId,
      message,
      type: "subscription_expiry",
      subject: "Hostezy Subscription Expiry Reminder",
    });
    createdCount += 1;
  }

  return {
    targetDate,
    totalMatched: subscriptions.length,
    createdCount,
  };
};

export const expireSubscriptionsAndNotify = async () => {
  const now = new Date();

  const subscriptions = await MessSubscription.find({
    status: "active",
    endDate: { $lt: now },
  })
    .populate("planId", "name")
    .lean();

  if (subscriptions.length === 0) {
    return { expiredCount: 0, notifiedCount: 0 };
  }

  const ids = subscriptions.map((subscription) => subscription._id);

  await MessSubscription.updateMany(
    { _id: { $in: ids } },
    { $set: { status: "expired" } }
  );

  let notifiedCount = 0;

  for (const subscription of subscriptions) {
    const planName = subscription.planId?.name || "your mess plan";
    const expiryDateText = new Date(subscription.endDate).toLocaleDateString("en-IN");
    const message = `Your subscription for ${planName} has expired on ${expiryDateText}. Please renew to continue mess services.`;

    const alreadySent = await Notification.findOne({
      userId: subscription.studentId,
      type: "subscription_expired",
      message,
    }).lean();

    if (alreadySent) {
      continue;
    }

    await createInAppAndEmailNotification({
      userId: subscription.studentId,
      type: "subscription_expired",
      message,
      subject: "Hostezy Subscription Expired",
    });
    notifiedCount += 1;
  }

  return {
    expiredCount: subscriptions.length,
    notifiedCount,
  };
};
