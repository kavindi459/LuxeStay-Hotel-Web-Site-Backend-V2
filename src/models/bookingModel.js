import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

    bookingId:{
        type: String,
        required: true,
        unique: true
    },
    // email: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true
    // },

    email: {
        type:String,
        required: true,


    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
    reason:{
        type: String,
        default: ""
    },
    notes:{
        type: String,
        default: ""
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["online", "pay_at_hotel"],
        default: "pay_at_hotel"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending"
    },
    paymentIntentId: {
        type: String,
        default: ""
    }


}, {
    timestamps: true
}
)

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking