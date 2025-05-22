import express from "express";
import { createGalleryItem } from "../controllers/galleryController.js";

const galleryItemRouter =express.Router();

galleryItemRouter.post("/create",createGalleryItem);


export default galleryItemRouter;