import express from "express";
import { gerUser } from "../controllers/usersController.js";



const userRouter =express.Router();


userRouter.get("/",gerUser);









export default userRouter;