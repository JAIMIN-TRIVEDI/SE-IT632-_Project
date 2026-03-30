import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();


app.use(errorHandler);
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());


app.use("/api/v1/auth",authRoutes);

export default app;