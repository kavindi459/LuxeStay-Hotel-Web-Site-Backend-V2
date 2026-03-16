import mongoose from 'mongoose';
import Booking from "../models/bookingModel.js";
import generateBookingId from "../utils/generateBookingId.js";
import Room from "../models/roomModel.js";
import Stripe from "stripe";
import { sendBookingConfirmationEmail, sendBookingStatusEmail } from "../services/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createBooking = async (req, res) => {
    const bookingId = await generateBookingId();

    const {
        roomId,
        checkInDate,
        checkOutDate,
        status,
        reason,
        notes,
        totalAmount,
    } = req.body;

    const { email } = req.user;

    try {
        // Check for overlapping booking for the same room
        const existingBooking = await Booking.findOne({
            roomId,
            status: { $ne: "cancelled" },
            $or: [
                {
                    checkInDate: { $lt: new Date(checkOutDate) },
                    checkOutDate: { $gt: new Date(checkInDate) },
                }
            ],
        });

        if (existingBooking) {
            return res.status(400).json({
                message: "Booking already exists for this date range.",
                success: false,
            });
        }

        const newBooking = new Booking({
            bookingId,
            email,
            roomId,
            checkInDate,
            checkOutDate,
            status,
            reason,
            notes,
            totalAmount,
        });

        await newBooking.save();

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBooking,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message,
        });
    }
};


export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();

        if (bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No bookings found",
                data: [],
            });
        }

        res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message,
        });
    }
};

export const getBookingbyId = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
            error: error.message,
        });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        booking.roomId = req.body.roomId || booking.roomId;
        booking.checkInDate = req.body.checkInDate || booking.checkInDate;
        booking.checkOutDate = req.body.checkOutDate || booking.checkOutDate;
        booking.status = req.body.status || booking.status;
        booking.reason = req.body.reason || booking.reason;
        booking.notes = req.body.notes || booking.notes;
        booking.totalAmount = req.body.totalAmount || booking.totalAmount;

        const updatedBooking = await booking.save();
        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: updatedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update booking",
            error: error.message,
        });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        await Booking.findByIdAndDelete(req.params.bookingId);
        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete booking",
            error: error.message,
        });
    }
};

// booking filter Date

export const retriveBookingByDate = async (req, res) => {
    try {
        const checkInDate = req.body.checkInDate;
        const checkOutDate = req.body.checkOutDate;

        const bookings = await Booking.find({
            checkInDate: { $gte: checkInDate, $lte: checkOutDate },
        });
        res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
            error: error.message,
        });
    }
};




// Create booking by checking availability in a Rooms
export const createBookingByRooms = async (req, res) => {
    try {
        // 🗓️ Step 1: Get check-in and check-out dates from user request
        const checkInDate = new Date(req.body.checkInDate);
        const checkOutDate = new Date(req.body.checkOutDate);

        // 🔍 Step 2: Find overlapping bookings for those dates (exclude cancelled)
        const overlappingBookings = await Booking.find({
            status: { $ne: "cancelled" },
            $or: [
                {
                    checkInDate: { $gte: checkInDate, $lt: checkOutDate },
                },
                {
                    checkOutDate: { $gt: checkInDate, $lte: checkOutDate },
                },
            ],
        });

        // 📛 Step 3: Get list of reserved room IDs from overlapping bookings
        const reservedRoomIds = overlappingBookings.map((b) => b.roomId);

        // 🏨 Step 4: Find available rooms using roomID provided in the request, and not in reservedRoomIds
        const availableRooms = await Room.find({
            _id: { $nin: reservedRoomIds }, // room must not be already booked
            roomID: req.body.roomID,        // must match the roomID client provided
        });

        // ❌ Step 5: If no rooms are available, return an appropriate response
        if (availableRooms.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No available rooms found for this roomID and dates",
                data: [],
            });
        }

        // 🛏️ Step 6: Choose first available room (you can improve this logic later)
        const roomToBook = availableRooms[0];

        // 🔢 Step 7: Generate booking ID (assume this comes from a utility)
        const bookingId = await generateBookingId();

        // 📥 Step 8: Extract remaining booking fields from request
        const {
            checkInDate: reqCheckInDate,
            checkOutDate: reqCheckOutDate,
            status,
            reason,
            notes,
            totalAmount,
            paymentMethod,
            paymentIntentId,
        } = req.body;

        // 💳 Step 8b: If online payment, verify PaymentIntent is succeeded
        if (paymentMethod === "online") {
            if (!paymentIntentId) {
                return res.status(400).json({
                    success: false,
                    message: "paymentIntentId is required for online payment",
                });
            }
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== "succeeded") {
                return res.status(400).json({
                    success: false,
                    message: "Payment has not been completed. Please complete your payment first.",
                });
            }
        }

        const { email } = req.user; // 🔐 Assuming req.user is filled from JWT or session

        // 🔁 Step 9: Double-check to avoid duplicate booking for the same room & date
        const existingBooking = await Booking.findOne({
            roomId: roomToBook._id,
            checkInDate: reqCheckInDate,
            checkOutDate: reqCheckOutDate,
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Booking already exists for this room in selected dates",
            });
        }

        // ✅ Step 10: Create new booking object
        const newBooking = new Booking({
            bookingId,
            email,
            roomId: roomToBook._id,
            checkInDate: reqCheckInDate,
            checkOutDate: reqCheckOutDate,
            status: "pending",
            reason,
            notes,
            totalAmount,
            paymentMethod: paymentMethod || "pay_at_hotel",
            paymentStatus: paymentMethod === "online" ? "paid" : "pending",
            paymentIntentId: paymentIntentId || "",
        });

        // 💾 Step 11: Save booking to database
        await newBooking.save();

        // ✉️ Step 12: Send booking request confirmation email
        try {
            const nights = Math.ceil((new Date(reqCheckOutDate) - new Date(reqCheckInDate)) / (1000 * 60 * 60 * 24));
            await sendBookingConfirmationEmail(email, {
                bookingId,
                roomName: roomToBook.roomID ? `Room #${roomToBook.roomID}` : "Your Room",
                checkInDate: reqCheckInDate,
                checkOutDate: reqCheckOutDate,
                totalAmount,
                nights,
                guestName: email,
            });
        } catch (emailErr) {
            console.error("Failed to send booking confirmation email:", emailErr.message);
        }

        // 🎉 Step 13: Send success response
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBooking,
        });

    } catch (error) {
        // 🛑 Error handling
        return res.status(500).json({
            success: false,
            message: "Error processing booking",
            error: error.message,
        });
    }
};


export const getMyBookings = async (req, res) => {
    try {
        const { email } = req.user;
        const bookings = await Booking.find({ email }).populate({
            path: "roomId",
            populate: { path: "category" }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch your bookings",
            error: error.message,
        });
    }
};


export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.email !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this booking",
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        booking.status = "cancelled";
        booking.reason = req.body.reason || "Cancelled by user";

        // If paid online, mark payment as refunded (manual refund — admin handles actual Stripe refund)
        if (booking.paymentMethod === "online" && booking.paymentStatus === "paid") {
            booking.paymentStatus = "refunded";
        }

        await booking.save();

        try {
            await sendBookingStatusEmail(booking.email, booking, "cancelled");
        } catch (emailErr) {
            console.error("Failed to send cancellation email:", emailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
            error: error.message,
        });
    }
};


// Admin: Confirm a booking and send confirmation email
export const confirmBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be confirmed",
            });
        }

        booking.status = "confirmed";
        await booking.save();

        try {
            await sendBookingStatusEmail(booking.email, booking, "confirmed");
        } catch (emailErr) {
            console.error("Failed to send confirmation email:", emailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: "Booking confirmed successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to confirm booking",
            error: error.message,
        });
    }
};


// Admin: Cancel a booking with reason and send cancellation email
export const adminCancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        booking.status = "cancelled";
        booking.reason = req.body.reason || "Cancelled by hotel";

        if (booking.paymentMethod === "online" && booking.paymentStatus === "paid") {
            booking.paymentStatus = "refunded";
        }

        await booking.save();

        try {
            await sendBookingStatusEmail(booking.email, booking, "cancelled");
        } catch (emailErr) {
            console.error("Failed to send cancellation email:", emailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
            error: error.message,
        });
    }
};
