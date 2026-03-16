import Gallary from "../models/galleryModel.js";


export const createGalleryItem =async (req, res) => {
  const{name,description,image} = req.body;
  try {
    const galleryItem = await Gallary.create({
      name,
      description: description || "",
      image: req.file ? req.file.path : image,
    });
    res.status(201).json({
      success: true,
      data: galleryItem,
      message: "Gallery item created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create gallery item",
      error: error.message,
    });
  }
}


export const getGalleryItems = async (req, res) => {
    try {
        const filter = req.query.featured === "true" ? { isFeatured: true } : {};
        const galleryItems = await Gallary.find(filter);

        if(galleryItems.length === 0){
            return res.status(200).json({
                success: true,
                message: "No gallery items found",
                data: [],
            });
        }
        res.status(200).json({
      success: true,
      data: galleryItems,
    });
    } catch (error) {
        res.status(500).json({
      success: false,
      message: "Failed to fetch gallery items",
      error: error.message,
    });
    }
}

export const toggleGalleryFeatured = async (req, res) => {
    try {
        const item = await Gallary.findById(req.params.galleryId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }
        item.isFeatured = !item.isFeatured;
        await item.save();
        res.status(200).json({ success: true, message: "Updated", data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update", error: error.message });
    }
}


export const getGalleryItemsById =async (req, res) => {
  try {
      const galleryItem = await Gallary.findById(req.params.GalleryId);
      if(!galleryItem){
        return res.status(404).json({
          success: false,
          message: "Gallery item not found",
        });
      }
      res.status(200).json({
        success: true,
        data: galleryItem,
      });


    
  } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch gallery item",
        error: error.message,
      });
    
  }

}


export const updateGalleryItem =async (req, res) => {
  try {
      const galleryItem = await Gallary.findById(req.params.GalleryId);
      if(!galleryItem){
        return res.status(404).json({
          success: false,
          message: "Gallery item not found",
        });
      }
      galleryItem.name = req.body.name || galleryItem.name;
      galleryItem.description = req.body.description || galleryItem.description;
      galleryItem.image = req.file ? req.file.path : galleryItem.image;
      const updatedGalleryItem = await galleryItem.save();
      res.status(200).json({
        success: true,
        message: "Gallery item updated successfully",
        data: updatedGalleryItem,
      });
  } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update gallery item",
        error: error.message,
      });
  }
}


export const deleteGalleryItem =async (req, res) => {
  try {
      const galleryItem = await Gallary.findByIdAndDelete(req.params.galleryId);
      if(!galleryItem){
        return res.status(404).json({
          success: false,
          message: "Gallery item not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Gallery item deleted successfully",
      });
  } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete gallery item",
        error: error.message,
      });
  }
}