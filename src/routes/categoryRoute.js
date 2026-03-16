import express from "express";
import { createCategory, deleteCategory, getCategories, getCategoriesByName, getCategoryById, updateCategory, toggleFeatured } from "../controllers/categoryController.js";
import { adminProtect, protect } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const categoryRouter =express.Router();


categoryRouter.post("/create",protect,adminProtect,upload.single("image") ,createCategory);

categoryRouter.get("/get" , getCategories);

categoryRouter.get("/getByName/:name",protect , getCategoriesByName);
categoryRouter.get("/getById/:CategoryId",protect , getCategoryById);

categoryRouter.put("/update/:CategoryId",protect,adminProtect,upload.single("image"), updateCategory);

categoryRouter.patch("/toggle-featured/:CategoryId", protect, adminProtect, toggleFeatured);
categoryRouter.delete("/delete/:CategoryId",protect,adminProtect, deleteCategory);




export default categoryRouter;
 