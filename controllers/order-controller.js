import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

const createOrder = async (req, res) => {
    try {
        const { phoneNumber, shippingaddress , items } = req.body;

        // Check if user exists
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Please provide valid items" });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate products and calculate total amount
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found` });
            }

            orderItems.push({
                product: product._id,
                title: product.title,
                images: product.images,
                size: item.size,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;
        }

        // Create the order
        const order = await Order.create({
            fullName: user._id,
            phoneNumber,
            shippingaddress,
            items: orderItems,
            totalAmount,
            expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        return res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        return res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

const generateFeatureProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const getRandomProducts = (arr) => arr.sort(() => 0.5 - Math.random()).slice(0, 4);
        const featuredProducts = getRandomProducts(products);
        return res.status(200).json({success: true,featuredProducts})

    } catch (error) {
        console.log(`Error generating featured products: ${error}`);
        return res.status(500).json({ error })
    }
}

const orderControllers = { createOrder , generateFeatureProducts };

export { orderControllers };
