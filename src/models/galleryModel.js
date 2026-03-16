import mongoose from "mongoose";


const gallaryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}
, {
    timestamps: true
});

const Gallary = mongoose.model("Gallary", gallaryItemSchema);
export default Gallary