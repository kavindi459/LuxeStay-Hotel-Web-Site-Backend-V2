import express from "express";

import { customerProtect, protect, adminProtect } from "../middlewares/authMiddleware.js";
import { createBooking, createBookingByRooms, deleteBooking, getBookingbyId, getBookings, retriveBookingByDate, updateBooking, getMyBookings, cancelBooking, confirmBooking, adminCancelBooking } from "../controllers/bookingController.js";

const bookingRouter= express.Router();


bookingRouter.post("/create",protect ,customerProtect,createBooking);

bookingRouter.get("/get",protect ,getBookings);

bookingRouter.get("/getById/:BookingId",protect ,getBookingbyId);

bookingRouter.post("/filterbydate",protect ,retriveBookingByDate);

bookingRouter.post("/createbycategory",protect ,customerProtect,createBookingByRooms);

bookingRouter.get("/mybookings", protect, getMyBookings);

bookingRouter.patch("/:bookingId/cancel", protect, cancelBooking);

bookingRouter.patch("/:bookingId/confirm", protect, adminProtect, confirmBooking);

bookingRouter.patch("/:bookingId/admin-cancel", protect, adminProtect, adminCancelBooking);

bookingRouter.patch("/update/:bookingId",protect,updateBooking);


bookingRouter.delete("/delete/:bookingId",protect,deleteBooking);




export default bookingRouter;