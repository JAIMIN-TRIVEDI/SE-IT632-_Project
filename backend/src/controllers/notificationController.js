import Notification from "../models/Notification.js";
import User from "../models/User.js";

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
    return "Hostel Admin";
  }

  if (!value) {
    return "Notification";
  }

  return value;
};

export const getNotifications = async(req,res)=>{

  const notifications = await Notification.find({
    userId:req.user._id
  }).sort({createdAt:-1}).lean();

  const formattedNotifications = notifications.map((notification) => ({
    ...notification,
    type: toDisplayType(notification.type),
  }));

  res.json({
    success:true,
    data:formattedNotifications
  });

};

export const markRead = async(req,res)=>{

  const notification = await Notification.findById(req.params.id);

  notification.isRead=true;

  await notification.save();

  res.json({
    success:true
  });

};

export const markAllRead = async(req,res)=>{

  await Notification.updateMany(
    {userId:req.user._id},
    {isRead:true}
  );

  res.json({
    success:true
  });

};

export const deleteNotification = async(req,res)=>{

  await Notification.findByIdAndDelete(req.params.id);

  res.json({
    success:true
  });

};

export const broadcastNotification = async(req,res)=>{
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

export const getAllNotifications = async(req,res)=>{
  const notifications = await Notification.find().sort({ createdAt: -1 }).lean();

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