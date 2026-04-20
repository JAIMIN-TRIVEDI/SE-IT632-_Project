import dotenv from "dotenv";

dotenv.config();   // MUST be first

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { Server } from "socket.io";
import { registerNotificationRealtimeEmitter } from "./src/services/notificationService.js";
import { processRoomRenewalLifecycle } from "./src/services/roomRenewalService.js";

connectDB();

const PORT = process.env.PORT || 5000;
const SOCKET_EVENT_NAME = process.env.NOTIFICATION_SOCKET_EVENT || "new_notification";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("[Socket] User connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    const room = String(userId).trim();
    socket.join(room);
    console.log("[Socket] User joined room:", room);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] User disconnected:", socket.id);
  });
});

registerNotificationRealtimeEmitter(({ event, payload }) => {
  const eventName = event || SOCKET_EVENT_NAME;
  const room = String(payload?.userId || "").trim();
  const notificationData = payload?.notification || payload;

  if (room) {
    io.to(room).emit(eventName, notificationData);
    return;
  }

  io.emit(eventName, notificationData);
});

//console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const RENEWAL_LIFECYCLE_INTERVAL_MS = Math.max(
  60 * 1000,
  Number(process.env.ROOM_RENEWAL_CRON_MS) || 60 * 60 * 1000,
);

const runRenewalLifecycle = async () => {
  try {
    const processed = await processRoomRenewalLifecycle();
    if (processed > 0) {
      console.log(`[RenewalLifecycle] Checked ${processed} active allocations`);
    }
  } catch (err) {
    console.error("[RenewalLifecycle] Failed:", err.message);
  }
};

runRenewalLifecycle();
setInterval(runRenewalLifecycle, RENEWAL_LIFECYCLE_INTERVAL_MS);