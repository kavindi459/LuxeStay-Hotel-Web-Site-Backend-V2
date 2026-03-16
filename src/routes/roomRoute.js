import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createRoom, deleteRoom, getRoomByCategory, getRoomId, getRooms, updateRoom, getAvailableRooms, toggleRoomStatus } from "../controllers/roomController.js";

const roomRouter = express.Router();


roomRouter.post("/create",protect ,createRoom);

roomRouter.get("/get", getRooms);

roomRouter.get("/available", getAvailableRooms);

roomRouter.get("/getById/:RoomId", getRoomId);

roomRouter.get("/getByCategory/:CategoryId", getRoomByCategory);


roomRouter.put("/update/:RoomId",protect, updateRoom);

roomRouter.patch("/toggle-status/:RoomId", protect, toggleRoomStatus);




roomRouter.delete("/delete/:RoomId",protect, deleteRoom);




export default roomRouter;