import express from "express";
import { createUser, deleteUser, getUser, getUserById, getUserprofile, loginUser, updateUser } from "../controllers/usersController.js";
import { adminProtect, protect } from "../middlewares/authMiddleware.js";




const userRouter =express.Router();




userRouter.post("/createuser",createUser);
userRouter.post("/login",loginUser);


userRouter.get("/",protect,adminProtect, getUser);

userRouter.put("/update/:UserId",protect, updateUser);

userRouter.delete("/delete/:UserId",protect,adminProtect, deleteUser);

userRouter.get("/get/:UserId",protect, getUserById);

userRouter.get("/getuserprofile",protect, getUserprofile);








export default userRouter;