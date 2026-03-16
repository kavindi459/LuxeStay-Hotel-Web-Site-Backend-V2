import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Stripe PaymentIntent — called before rendering the card form
export const createPaymentIntent = async (req, res) => {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid amount",
        });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100), // dollars → cents
            currency: "usd",
            metadata: {
                userEmail: req.user.email,
            },
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create payment intent",
            error: error.message,
        });
    }
};

// Verify a payment intent — called after Stripe.js confirms the payment
export const verifyPaymentIntent = async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({
            success: false,
            message: "paymentIntentId is required",
        });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                success: false,
                message: `Payment not completed. Status: ${paymentIntent.status}`,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified",
            status: paymentIntent.status,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message,
        });
    }
};
