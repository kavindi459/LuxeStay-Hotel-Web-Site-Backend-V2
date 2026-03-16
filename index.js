import bodyParser from "body-parser";
import express from "express";
import userRouter from "./src/routes/usersRoute.js";
import connectDB from './src/config/db.js';
import { PORT } from "./src/config/env.js";
import dotenv from 'dotenv';
import errorHandler from './src/middlewares/error.middleware.js';
import galleryItemRouter from "./src/routes/galleryRoute.js";
import cors from "cors";
import categoryRouter from "./src/routes/categoryRoute.js";
import roomRouter from "./src/routes/roomRoute.js";
import bookingRouter from "./src/routes/bookingRoute.js";
import reviewRouter from "./src/routes/reviewRoute.js";
import adminRouter from "./src/routes/adminRoute.js";
import contactRouter from "./src/routes/contactRoute.js";
import bgImageRouter from "./src/routes/bgImageRoute.js";
import destinationRouter from "./src/routes/destinationRoute.js";
import paymentRouter from "./src/routes/paymentRoute.js";

dotenv.config();
const app = express();

connectDB();

// CORS - allow requests from frontend origin
// For production, replace with specific origin from env: origin: process.env.FRONTEND_URL
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   credentials: true,
// }));

app.use(cors());

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/category", categoryRouter);
app.use("/api/room", roomRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/review", reviewRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);
app.use("/api/bgimage", bgImageRouter);
app.use("/api/destination", destinationRouter);
app.use("/api/payment", paymentRouter);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware — must be AFTER all routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
