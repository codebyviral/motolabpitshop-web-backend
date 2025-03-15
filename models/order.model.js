import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerName :{
        type: String,
        ref: "User"
    },
    product :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    amount :{
        type: Number,
        required: true
    },
    placedAt: { 
        type: Date, 
        default: Date.now 
    },
    expectedDelivery: { 
        type: Date, 
        required: true 
    }
})


export const Order = mongoose.model("Order", orderSchema);