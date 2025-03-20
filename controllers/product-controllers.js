import { Product } from "../models/product.model.js";
import { uploadCloudinery } from "../utils/cloudinary.utils.js";
import { ProductSchema } from "../validation/auth.validation.js";

export const getProductById = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        return res.status(200).json({ success: true, product })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error })
    }
}

export const productController = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging
        console.log("Request File:", req.files); // Debugging (Changed from req.files to req.file)

        const { data, error } = ProductSchema.safeParse(req.body);
        if (error) {
            return res.status(400).json({ message: error.errors[0].message });
        }

        const { title, description, price, rating, size, category } = data;

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

        // Upload images sequentially
        let imageUrls = [];
        for (const file of req.files) {
            const uploadedImage = await uploadCloudinery(file.path);
            if (uploadedImage.url) {
                imageUrls.push(uploadedImage.url);
            }
        }

        if (imageUrls.length === 0) {
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

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ success: true, products })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error })
    }
}