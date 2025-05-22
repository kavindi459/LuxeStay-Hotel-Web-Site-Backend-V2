import Gallary from "../models/galleryModel.js";


export const createGalleryItem =async (req, res) => {
    const galleryItem = req.body;

    const newGalleryItem = new Gallary(galleryItem);
    try {
        await newGalleryItem.save();
         res.status(201).json({
      success: true,
      message:"Galley Item Created successfully ",
      data: newGalleryItem,
    });
    } catch (error) {
        res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
    }
}