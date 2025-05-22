import mongoose from "mongoose";


const gallaryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const Gallary = mongoose.model("Gallary", gallaryItemSchema);
export default Gallary