import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import roomRequestRoutes from "./routes/roomRequestRoutes.js";
import messRoutes from "./routes/messRoutes.js";
import hostelRoutes from "./routes/hostelRoutes.js";

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", roomRequestRoutes);
app.use("/api/v1", messRoutes);
app.use("/api/v1/hostels", hostelRoutes);

app.use(errorHandler);
export default app;