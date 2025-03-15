import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    images: {
        type: [String],
        default: [],
    }
})

export const Product = new mongoose.model("Product", productSchema)