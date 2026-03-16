import Room from "../models/roomModel.js"
import Booking from "../models/bookingModel.js";
import generateRoomId from "../utils/generateRoomId.js";




export const createRoom = async (req, res) => {
    const roomData = req.body;

    // Generate new room ID
    const newRoomID = await generateRoomId();

    // Merge generated room ID into the room data
    const newRoom = new Room({
        ...roomData,
        roomID: newRoomID,
    });

    try {
        await newRoom.save();
        res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: newRoom,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create room",
            error: error.message,
        });
    }
};



export const getRooms =async(req, res) =>{
    try{
        const rooms =await Room.find().populate("category");

        if(rooms.length === 0){
            return res.status(200).json({
                success: true,
                message: "No rooms found",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            data: rooms,
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms",
            error: error.message,
        });
    }
}


export const getRoomId =async(req, res) =>{
    try{
        const room =await Room.findById(req.params.RoomId).populate("category");

        if(!room){
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }
        res.status(200).json({
            success: true,
            data: room,
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to fetch room",
            error: error.message,
        });
    }
}


export const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.RoomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }


        room.roomID = req.body.roomID ?? room.roomID;
        room.category = req.body.category ?? room.category;
        room.maxGuests = req.body.maxGuests ?? room.maxGuests;
        room.availability = req.body.availability ?? room.availability;
        room.photos = req.body.photos ?? room.photos;
        room.description = req.body.description ?? room.description;

        const updatedRoom = await room.save();

        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            data: updatedRoom,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update room",
            error: error.message,
        });
    }
};

export const deleteRoom =async(req, res) =>{
    try{
        const room =await Room.findByIdAndDelete(req.params.RoomId);

        if(!room){
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Failed to delete room",
            error: error.message,
        });
    }
}



export const getRoomByCategory = async (req, res) => {
    try {
        const rooms = await Room.find({ category: req.params.category });

        if(rooms.length === 0){
            return res.status(200).json({
                success: true,
                message: "No rooms found",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            data: rooms,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms by category",
            error: error.message,
        });
    }
};


export const toggleRoomStatus = async (req, res) => {
    try {
        const room = await Room.findById(req.params.RoomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        room.availability = !room.availability;
        await room.save();

        res.status(200).json({
            success: true,
            message: `Room is now ${room.availability ? 'available' : 'occupied'}`,
            data: { availability: room.availability },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update room status",
            error: error.message,
        });
    }
};


export const getAvailableRooms = async (req, res) => {
    try {
        const { checkIn, checkOut, guests, category } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: "checkIn and checkOut dates are required",
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Find bookings that overlap with the requested date range (exclude cancelled)
        const overlappingBookings = await Booking.find({
            status: { $ne: "cancelled" },
            $or: [
                {
                    checkInDate: { $lt: checkOutDate },
                    checkOutDate: { $gt: checkInDate },
                },
            ],
        });

        const bookedRoomIds = overlappingBookings.map((b) => b.roomId);

        // Build filter query
        const filter = {
            _id: { $nin: bookedRoomIds },
            availability: true,
        };

        if (guests) {
            filter.maxGuests = { $gte: Number(guests) };
        }

        if (category) {
            filter.category = category;
        }

        const rooms = await Room.find(filter).populate("category");

        return res.status(200).json({
            success: true,
            data: rooms,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch available rooms",
            error: error.message,
        });
    }
};