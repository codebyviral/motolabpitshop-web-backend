import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    fullName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            title: {
                type: String,
                required: true
            },
            images: {
                type: [String], // Array of image URLs
                required: true
            },
            size: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
                default: 'Pending'
            }
        }
    ],
    phoneNumber: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: String,
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
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
