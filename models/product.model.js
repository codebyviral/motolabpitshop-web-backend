import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    images:{
        type: [String],
        required: true
    },
    rating:{
        type: Number,
        default: 0,
        max : 5,
        required : false
    },
    size:{
        type: String
    },
    category:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
},
{
    timestamps: true,
}
)

export const Product = mongoose.model("Product", productSchema);
