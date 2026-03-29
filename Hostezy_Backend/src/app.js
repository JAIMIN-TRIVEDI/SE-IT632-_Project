import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import hostelRoutes from "./routes/hostelRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import messRoutes from "./routes/messRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import vacateRoutes from "./routes/vacateRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();



app.use(errorHandler);
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth",authRoutes);

app.use("/api/v1/hostels",hostelRoutes);
app.use("/api/v1",roomRoutes);

app.use("/api/v1",complaintRoutes);

app.use("/api/v1",messRoutes);

app.use("/api/v1",paymentRoutes);

app.use("/api/v1",vacateRoutes);

app.use("/api/v1",notificationRoutes);

app.use("/api/v1",reportRoutes);

export default app;