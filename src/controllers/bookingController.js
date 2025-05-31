import Booking from "../models/bookingModel.js";
import generateBookingId from "../utils/generateBookingId.js";

export const createBooking = async (req, res) => {
    
        const bookingId = await generateBookingId(); 
     
        const {
                
                roomId,
                checkInDate,
                checkOutDate,
                status,
                reason,
                notes,
                totalAmount
        } = req.body;
       
        const {email} = req.user

        try{

        const existingBooking = await Booking.findOne({  bookingId,roomId,checkInDate,checkOutDate });
        if (existingBooking) {
            return res.status(400).json({
                message: "Booking already exists",
                success: false,
            });
        }

        const newBooking = new Booking({ 
                bookingId,
                email: email,
                roomId,
                checkInDate,
                checkOutDate,
                status,
                reason,
                notes,
                totalAmount

        });
        await newBooking.save(); 
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBooking,
        });
        }catch(error){
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



export const getBookingbyId =async (req,res) =>{
        try{
               const booking = await Booking.findById(req.params.bookingId);
               
               if(!booking){
                return res.status(404).json({
                    success: false,
                    message: "Booking not found",
                });
               }

               res.status(200).json({
                success: true,
                data: booking,
               });
        }catch(error){
            res.status(500).json({
                success: false,
                message: "Failed to fetch booking",
                error: error.message,
            });
        }
}


export const updateBooking =async (req,res) =>{
    try{
        const booking = await Booking.findById(req.params.bookingId);
        if(!booking){
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
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to update booking",
            error: error.message,
        });
    }
}


export const deleteBooking =async (req,res) =>{ 
    try{
        const booking = await Booking.findById(req.params.bookingId);
        if(!booking){
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        await booking.remove();
        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to delete booking",
            error: error.message,
        });
    }
}