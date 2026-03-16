import Category from "../models/categoryModel.js";



export const createCategory =  async (req, res) => {
   const {
    name,
    price,
    features,
    description,
    image
   } = req.body;
   
   try {
    const existingCategory =await Category.findOne({name});
    if(existingCategory){
        return res.status(400).json({
            success: false,
            message: "Category already exists",
        });
    }
    const category = await Category.create({
        name,
        price,
        features,
        description,
        image:req.file ? req.file.path : null
    });
    category.save();
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
    });
    
   } catch (error) {
    res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error.message,
    });
    
   }

   
}





export const getCategories = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.featured === 'true') filter.isFeatured = true;

    const total      = await Category.countDocuments(filter);
    const categories = await Category.find(filter).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};



export const updateCategory =async (req, res) => {
    try {
        const category = await Category.findById(req.params.CategoryId);   
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        category.name = req.body.name || category.name;
        category.price = req.body.price || category.price;
        category.features = req.body.features || category.features;
        category.description = req.body.description || category.description;
        category.image = req.file ? req.file.path :category.image;
        const updatedCategory = await category.save();
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
        

    }catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update category",
            error: error.message,
        });
    }    
}



export const getCategoriesByName = async (req, res) => {
    try {
        const category = await Category.find({ name: req.params.name });
     
        if(!category){
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message,
        });
    }
};



export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.CategoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch category",
            error: error.message,
        });
    }
};


export const toggleFeatured = async (req, res) => {
    try {
        const category = await Category.findById(req.params.CategoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.isFeatured = !category.isFeatured;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category is now ${category.isFeatured ? 'featured' : 'unfeatured'}`,
            data: { isFeatured: category.isFeatured },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to toggle featured", error: error.message });
    }
};


export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.CategoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete category",
            error: error.message,
        });
    }
};