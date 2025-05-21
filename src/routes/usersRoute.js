import express from "express";
import { createUser, getUser } from "../controllers/usersController.js";



const userRouter =express.Router();


userRouter.get("/",getUser);

userRouter.post("/createuser",createUser);









export default userRouter;