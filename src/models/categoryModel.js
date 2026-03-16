import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price :{
        type: Number,
        required: true
    },
    features :[
        {
            type: String,
           
        }
    ],
    description :{
        type: String,
        required: true
    },
    image :{
        type: String,

    },
    isFeatured: {
        type: Boolean,
        default: false,
    }

}
, {
    timestamps: true
}
);

const Category = mongoose.model("Category", categorySchema);
export default Category