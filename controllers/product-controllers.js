import { Product } from "../models/product.model.js";
import { uploadCloudinery } from "../utils/cloudinary.utils.js";
import {ProductSchema }from "../validation/auth.validation.js"
export const productController = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging
        console.log("Request Files:", req.files); // Debugging
        const { data, error } = ProductSchema.safeParse(req.body)
                if (error) {
                    res.json({
                        message: error.errors[0].message
                    })
                }
        // Multer stores form-data fields separately, parse it correctly
        const { title, description, price, rating, size, category } = data;

        // Ensure all fields are received
        if (!title || !description || !price || !rating || !size || !category) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        const productExist = await Product.findOne({ title });
        if (productExist) {
            return res.status(400).json({ error: "Product already exists." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "At least one image file is required." });
        }

        // Upload to Cloudinary
        const imageUrls = await Promise.all(
            req.files.map(async (file) => {
                const uploadedImage = await uploadCloudinery(file.path);
                return uploadedImage?.url;
            })
        );

        if (!imageUrls || imageUrls.length === 0) {
            return res.status(500).json({ error: "Image upload to Cloudinary failed." });
        }

        
        const newProduct = await Product.create({
            title,
            description,
            price,
            rating,
            size,
            category,
            images: imageUrls, 
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product: newProduct,
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
