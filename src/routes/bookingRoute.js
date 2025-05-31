import express from "express";

import { customerProtect, protect } from "../middlewares/authMiddleware.js";
import { createBooking, deleteBooking, getBookingbyId, getBookings, updateBooking } from "../controllers/bookingController.js";

const bookingRouter= express.Router();


bookingRouter.post("/create",protect ,customerProtect,createBooking);

bookingRouter.get("/get",protect ,getBookings);

bookingRouter.get("/getById/:BookingId",protect ,getBookingbyId);


bookingRouter.patch("/update/:bookingId",protect,updateBooking);

bookingRouter.delete("/delete/:bookingId",protect,deleteBooking);




export default bookingRouter;