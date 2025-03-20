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
        console.log("Request File:", req.file); // Debugging (Changed from req.files to req.file)

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

        const imagePath = req.files.images[0]?.path || null;
        if (!imagePath) {
            throw new ApiError(400, "Image field is required");
        }

        const image = await uploadCloudinery(imagePath);
        if (!image) {
            throw new ApiError(500, "Image upload failed");
        }


        const newProduct = await Product.create({
            title,
            description,
            price,
            rating,
            size,
            category,
            images: image?.url,
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