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

        const { title, description, price, category,quantity,size } = data;

        if (!title || !description || !price || !category || !quantity) {
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
            quantity,
            category,
            size,
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

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    console.log("Updating product with ID:", id);
    console.log(req.body)
    console.log(req.files)
   
    const { data, error } = ProductSchema.safeParse(req.body);
    if (error) {
        return res.status(400).json({ message: error.errors[0].message });
    }

    try {
        // Find the existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let imageUrls = product.images;  // Keep existing images

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            // **Step 1: Delete old images from Cloudinary**
            for (const imgUrl of product.images) {
                const publicId = imgUrl.split("/").pop().split(".")[0];  
                await cloudinary.uploader.destroy(publicId);
            }

            // **Step 2: Upload new images to Cloudinary**
            imageUrls = [];
            for (const file of req.files) {
                const uploadedImage = await uploadCloudinery(file.path);
                if (uploadedImage.url) {
                    imageUrls.push(uploadedImage.url);
                }
            }
        }

        // Create an update object with only provided fields
        const updateFields = {};
        console.log(data.title)
        if (data.title) updateFields.title = data.title;
        if (data.description) updateFields.description = data.description;
        if (data.price) updateFields.price = data.price;
        if (data.size) updateFields.size = data.size;
        if (data.category) updateFields.category = data.category;
        if (data.quantity) updateFields.quantity = data.quantity;
        if (req.files && req.files.length > 0) updateFields.images = imageUrls; 

        // Update the product in the database
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        return res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error in product update controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProduct = async (req, res) => {
    const {id} = req.params;
    console.log(id);
    try {
        const product = await Product.findByIdAndDelete(id);
        res.status(200).json({messege : "product deleted" , product});
    } catch (error) {
        console.log(error);
    }
}