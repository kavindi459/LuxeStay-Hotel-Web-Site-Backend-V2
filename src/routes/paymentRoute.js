import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createPaymentIntent, verifyPaymentIntent } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

// Create a payment intent (returns clientSecret for Stripe.js)
paymentRouter.post("/create-intent", protect, createPaymentIntent);

// Verify payment intent is succeeded before creating booking
paymentRouter.post("/verify", protect, verifyPaymentIntent);

export default paymentRouter;
