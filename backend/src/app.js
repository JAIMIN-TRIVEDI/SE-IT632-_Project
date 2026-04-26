import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import roomRequestRoutes from "./routes/roomRequestRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messRoutes from "./routes/messRoutes.js";
import hostelRoutes from "./routes/hostelRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import vacateRoutes from "./routes/vacateRoutes.js";
import wardenRoutes from "./routes/wardenRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";


const app = express();

const DEFAULT_DEV_ORIGINS = ["http://localhost:5173"];
const DEFAULT_PROD_ORIGINS = ["https://hostezy.netlify.app"];

const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = envOrigins.length > 0
  ? envOrigins
  : (process.env.NODE_ENV === "production" ? DEFAULT_PROD_ORIGINS : DEFAULT_DEV_ORIGINS);


app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", roomRequestRoutes);
app.use("/api/v1", roomRoutes);
app.use("/api/v1", messRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", vacateRoutes);
app.use("/api/v1", wardenRoutes);
app.use("/api/v1", complaintRoutes);
app.use("/api/v1/hostels", hostelRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/support", supportRoutes);

app.use(errorHandler);
export default app;