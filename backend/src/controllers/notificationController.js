import Notification from "../models/Notification.js";
import User from "../models/User.js";
import MessSubscription from "../models/MessSubscription.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { createNotificationsBulk } from "../services/notificationService.js";
import mongoose from "mongoose";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const AUDIENCE_ROLE_MAP = {
  student: ["student"],
  warden: ["warden"],
  both: ["student", "warden"],
};

const normalizeAudience = (audience = "students") => {
  const value = String(audience).trim().toLowerCase();

  if (["student", "students"].includes(value)) return "student";
  if (value === "warden") return "warden";
  if (["both", "all"].includes(value)) return "both";

  return null;
};

const toDisplayType = (rawType = "") => {
  const value = String(rawType).trim();

  if (value.startsWith("system:")) {
    const [, source = ""] = value.split(":");
    const actor = source.toLowerCase();

    if (actor === "mess_admin") {
      return "Mess Admin";
    }

    if (actor === "hostel_admin") {
      return "Hostel Admin";
    }

    if (actor === "warden") {
      return "Warden";
    }

    return "System";
  }

  if (!value) {
    return "Notification";
  }

  return value;
};

export const getNotifications = async (req, res) => {

  const search = (req.query.search || "").trim();
  const query = {
    userId: req.user._id,
    isDeleted: { $ne: true },
  };

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { message: { $regex: safeSearch, $options: "i" } },
      { type: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();

  const formattedNotifications = notifications.map((notification) => ({
    ...notification,
    type: toDisplayType(notification.type),
  }));

  res.json({
    success: true,
    data: formattedNotifications
  });

};

export const markRead = async (req, res) => {

  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isDeleted: { $ne: true },
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found." });
  }

  notification.isRead = true;

  await notification.save();

  res.json({
    success: true
  });

};

export const markAllRead = async (req, res) => {

  await Notification.updateMany(
    { userId: req.user._id, isDeleted: { $ne: true } },
    { isRead: true }
  );

  res.json({
    success: true
  });

};

export const deleteNotification = async (req, res) => {
  const notificationId = String(req.params.id || "").trim();
  const io = req.app.get("io");

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).json({ message: "Invalid notification id." });
  }

  const isAdmin = ["mess_admin", "hostel_admin", "warden"].includes(String(req.user?.role || ""));

  if (isAdmin) {
    const source = await Notification.findOne({
      _id: notificationId,
      sentBy: req.user._id,
      isDeleted: { $ne: true },
    }).lean();

    if (!source) {
      return res.status(404).json({ message: "Notification not found or not authorized to delete." });
    }

    const matchedNotifications = await Notification.find(
      {
        sentBy: req.user._id,
        isDeleted: { $ne: true },
        ...(source.notificationBatchId
          ? { notificationBatchId: source.notificationBatchId }
          : { type: source.type, message: source.message }),
      },
      { _id: 1, notificationBatchId: 1 }
    ).lean();

    const batchId = source.notificationBatchId || source.type;
    const matchedIds = matchedNotifications.map((item) => String(item._id));

    await Notification.updateMany(
      {
        sentBy: req.user._id,
        isDeleted: { $ne: true },
        ...(source.notificationBatchId
          ? { notificationBatchId: batchId }
          : { type: source.type, message: source.message }),
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );

    if (io) {
      io.emit("delete_notification", {
        id: notificationId,
        ids: matchedIds,
        notificationBatchId: source.notificationBatchId || null,
      });
    }
  } else {
    const deleted = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: req.user._id,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found." });
    }

    if (io) {
      io.to(String(req.user._id)).emit("delete_notification", {
        id: String(deleted._id),
        ids: [String(deleted._id)],
        notificationBatchId: deleted.notificationBatchId || null,
      });
    }
  }

  res.json({
    success: true
  });

};

export const getNotificationTargetStudents = async (req, res) => {
  const students = await User.find({
    role: "student",
    isActive: true,
  })
    .select("_id name email enrollmentNo")
    .sort({ name: 1 })
    .lean();

  return sendSuccess(res, 200, "Notification target students fetched successfully", students);
};

export const broadcastNotification = async (req, res) => {
  const title = String(req.body.title || "").trim();
  const message = String(req.body.message || "").trim();
  const audience = normalizeAudience(req.body.audience);

  if (!title) {
    return res.status(400).json({ message: "Notification title is required." });
  }

  if (!message) {
    return res.status(400).json({ message: "Notification message is required." });
  }

  if (!audience) {
    return res.status(400).json({ message: "Please choose a valid audience: students, warden, or both." });
  }

  const users = await User.find({
    role: { $in: AUDIENCE_ROLE_MAP[audience] },
    isActive: true,
  }).select("_id role");

  if (!users.length) {
    return res.status(404).json({ message: "No active users found for the selected audience." });
  }

  const broadcastId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const typedMarker = `system:${audience}:${broadcastId}`;
  const combinedMessage = `${title}\n\n${message}`;

  const notifications = users.map((user) => ({
    userId: user._id,
    message: combinedMessage,
    type: typedMarker,
  }));

  await Notification.insertMany(notifications);

  res.json({
    success: true,
    message: "Broadcast sent",
    data: {
      broadcastId,
      audience,
      recipients: notifications.length,
    },
  });

};

export const getAllNotifications = async (req, res) => {
  const notifications = await Notification.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();

  const groupedMap = new Map();

  notifications.forEach((item) => {
    const rawType = String(item.type || "system");

    if (!rawType.startsWith("system:")) {
      return;
    }

    const [kind, audiencePart, idPart] = rawType.split(":");

    const audience = ["student", "warden", "both"].includes(audiencePart)
      ? audiencePart
      : "student";
    const broadcastId = kind === "system" && idPart ? idPart : String(item._id);

    if (!groupedMap.has(broadcastId)) {
      const fullMessage = String(item.message || "");
      const [firstLine, ...restLines] = fullMessage.split("\n\n");
      const parsedTitle = (firstLine || "").trim();
      const parsedMessage = restLines.length ? restLines.join("\n\n").trim() : fullMessage;

      groupedMap.set(broadcastId, {
        broadcastId,
        title: parsedTitle || "Notification",
        message: parsedMessage,
        audience,
        recipientRoles: [],
        recipientCount: 0,
        createdAt: item.createdAt,
        createdBy: null,
      });
    }

    const current = groupedMap.get(broadcastId);
    current.recipientCount += 1;

    if (audience === "both") {
      current.recipientRoles = ["student", "warden"];
    } else if (!current.recipientRoles.includes(audience)) {
      current.recipientRoles.push(audience);
    }
  });

  const broadcasts = Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const stats = broadcasts.reduce(
    (acc, broadcast) => {
      acc.totalBroadcasts += 1;
      acc.totalRecipients += broadcast.recipientCount || 0;

      if (broadcast.audience === "student") acc.studentBroadcasts += 1;
      if (broadcast.audience === "warden") acc.wardenBroadcasts += 1;
      if (broadcast.audience === "both") acc.bothBroadcasts += 1;

      return acc;
    },
    {
      totalBroadcasts: 0,
      totalRecipients: 0,
      studentBroadcasts: 0,
      wardenBroadcasts: 0,
      bothBroadcasts: 0,
    }
  );

  res.json({
    success: true,
    data: {
      broadcasts,
      stats,
    },
  });

};

export const getNotificationsByUserId = async (req, res) => {
  const notifications = await Notification.find({
    userId: req.params.userId,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });

  return sendSuccess(res, 200, "User notifications fetched successfully", notifications);
};

const parseNotificationMessage = (value = "") => {
  const fullMessage = String(value || "");
  const [titleLine, ...bodyLines] = fullMessage.split("\n\n");

  return {
    title: (titleLine || "Notification").trim(),
    message: (bodyLines.length ? bodyLines.join("\n\n") : fullMessage).trim(),
  };
};

const toTargetLabel = (targetType = "all") => {
  if (targetType === "subscription") return "Plan";
  if (targetType === "users") return "Specific";
  return "All";
};

export const getSentNotifications = async (req, res) => {
  const search = String(req.query.search || "").trim();
  const deletedMode = String(req.query.deleted || "exclude").trim().toLowerCase();

  const query = {
    sentBy: req.user._id,
  };

  if (deletedMode === "only") {
    query.isDeleted = true;
  } else if (deletedMode === "include") {
    query.isDeleted = { $in: [true, false] };
  } else {
    query.isDeleted = { $ne: true };
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { message: { $regex: safeSearch, $options: "i" } },
      { targetType: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const docs = await Notification.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const groupedMap = new Map();

  docs.forEach((item) => {
    const groupKey = item.notificationBatchId || `${item.type || "type"}:${item.message || "message"}`;

    if (!groupedMap.has(groupKey)) {
      const parsed = parseNotificationMessage(item.message);

      groupedMap.set(groupKey, {
        _id: String(item._id),
        notificationBatchId: item.notificationBatchId || null,
        title: parsed.title,
        message: parsed.message,
        messagePreview: parsed.message.slice(0, 140),
        targetType: item.targetType || "all",
        targetLabel: toTargetLabel(item.targetType || "all"),
        status: item.isDeleted ? "archived" : "sent",
        deletedAt: item.deletedAt || null,
        recipientCount: 0,
        createdAt: item.createdAt,
      });
    }

    const current = groupedMap.get(groupKey);
    current.recipientCount += 1;
  });

  const notifications = Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return sendSuccess(res, 200, "Sent notifications fetched successfully", notifications);
};

const TARGET_TYPES = ["all", "subscription", "users"];

export const sendNotificationToStudents = async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const message = String(req.body?.message || "").trim();
  const targetType = String(req.body?.targetType || "").trim().toLowerCase();
  const selectedPlanId = String(req.body?.planId || "").trim();
  const selectedUserIds = Array.isArray(req.body?.targetUsers) ? req.body.targetUsers : [];

  if (!title) {
    return res.status(400).json({ message: "Notification title is required." });
  }

  if (!message) {
    return res.status(400).json({ message: "Notification message is required." });
  }

  if (!TARGET_TYPES.includes(targetType)) {
    return res.status(400).json({ message: "targetType must be one of: all, subscription, users." });
  }

  let userIds = [];

  if (targetType === "all") {
    const users = await User.find({ role: "student", isActive: true }).select("_id").lean();
    userIds = users.map((user) => String(user._id));
  }

  if (targetType === "subscription") {
    if (!selectedPlanId || !mongoose.Types.ObjectId.isValid(selectedPlanId)) {
      return res.status(400).json({ message: "Valid planId is required for targetType subscription." });
    }

    const activeSubscribers = await MessSubscription.find({
      planId: selectedPlanId,
      status: "active",
    }).select("studentId").lean();

    userIds = [...new Set(activeSubscribers.map((row) => String(row.studentId)).filter(Boolean))];
  }

  if (targetType === "users") {
    console.log("[Notification] Target users:", selectedUserIds);

    const validIds = selectedUserIds
      .map((id) => String(id || "").trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (!validIds.length) {
      return res.status(400).json({ message: "At least one valid user id is required for targetType users." });
    }

    const users = await User.find({
      _id: { $in: validIds },
      role: "student",
      isActive: true,
    }).select("_id").lean();

    userIds = users.map((user) => String(user._id));
    userIds.forEach((userId) => {
      console.log("[Notification] Sending to:", userId);
    });
  }

  if (!userIds.length) {
    return res.status(404).json({ message: "No target students found for selected target type." });
  }

  const combinedMessage = `${title}\n\n${message}`;
  const timestamp = Date.now();
  const senderRole = String(req.user?.role || "mess_admin").toLowerCase();
  const senderMarker = senderRole === "warden" ? "warden" : "mess_admin";
  const typedMarker = `system:${senderMarker}:${targetType}:${timestamp}`;
  const notificationBatchId = `mess-admin-${timestamp}-${Math.random().toString(16).slice(2, 8)}`;

  const payload = userIds.map((id) => ({
    userId: id,
    message: combinedMessage,
    type: typedMarker,
    sentBy: req.user._id,
    notificationBatchId,
    targetType,
    targetUsers: targetType === "users" ? userIds : undefined,
    targetPlanId: targetType === "subscription" ? selectedPlanId : undefined,
  }));

  const created = await createNotificationsBulk(payload);

  const representative = created[0];

  return sendSuccess(res, 201, "Notification sent successfully.", {
    id: representative?._id || null,
    notificationBatchId,
    title,
    message,
    recipients: created.length,
    targetType,
    status: "sent",
    createdAt: representative?.createdAt || new Date(),
  });
};