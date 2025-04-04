import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { uploadCloudinery } from "../utils/cloudinary.utils.js";
import { ProductSchema } from "../validation/auth.validation.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const productController = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging
    console.log("Request File:", req.files); // Debugging (Changed from req.files to req.file)

    const { data, error } = ProductSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    const { title, description, price, category, quantity, size } = data;

    if (!title || !description || !price || !category || !quantity) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    const productExist = await Product.findOne({ title });
    if (productExist) {
      return res.status(400).json({ error: "Product already exists." });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one image file is required." });
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
      return res
        .status(500)
        .json({ error: "Image upload to Cloudinary failed." });
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
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export const updateProduct = async (req, res) => {
  console.log("🔍 Request Headers:", req.headers);
  console.log("🔍 Request Body:", req.body); // Check if req.body is still empty
  console.log("🔍 Request Files:", req.files); // Check if images are coming

  // If req.body is empty, send an error
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Request body is empty! Check frontend request format.",
    });
  }

  const { id } = req.params;
  const { data, error } = ProductSchema.safeParse(req.body);
  if (error) {
    return res.status(400).json({ message: error.errors[0].message });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrls = product.images; // Keep existing images

    // ✅ Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const imgUrl of product.images) {
        const publicId = imgUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new images to Cloudinary
      imageUrls = [];
      for (const file of req.files) {
        const uploadedImage = await uploadCloudinery(file.path);
        if (uploadedImage.url) {
          imageUrls.push(uploadedImage.url);
        }
      }
    }

    // ✅ Create dynamic update object
    const updateObject = {};
    if (data.title) updateObject.title = data.title;
    if (data.description) updateObject.description = data.description;
    if (data.price) updateObject.price = data.price;
    if (data.category) updateObject.category = data.category;
    if (data.hasOwnProperty("quantity")) updateObject.quantity = data.quantity;
    if (data.size) updateObject.size = data.size;
    if (imageUrls.length > 0) updateObject.images = imageUrls; // Only update images if new ones exist

    // ✅ Update product with new values
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateObject },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in product update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const product = await Product.findByIdAndDelete(id);
    res.status(200).json({ messege: "product deleted", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
};

export const deleteCartItems = async (req, res) => {
  const userId = req.query.userId;
  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "User ID is required" });
  try {
    const userCartDeleted = await User.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Cart Items Deleted Successfully" });
  } catch (error) {
    console.log(`Error clearing Items: ${error}`);
    return res.status(500).json({ success: false, error });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.find({}).select("category");
    return res.status(200).json({ categories });
  } catch (error) {
    console.log(`Error getting categories: ${error}`);
    return res.status(500).json({ success: false, error });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, cartItemId } = req.params;
    const { action, newQuantity } = req.body;

    console.log("userId:", userId);
    console.log("cartItemId:", cartItemId);
    console.log("Action:", action);

    // Convert cartItemId to ObjectId
    const objectIdCartItemId = new mongoose.Types.ObjectId(cartItemId);

    // Fetch product to check stock availability
    const product = await Product.findById(objectIdCartItemId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Fetch the user document
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the cart item by productId
    const itemFound = user.cart.find(
      (item) => item.productId.toString() === objectIdCartItemId.toString()
    );

    if (!itemFound) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    // Handle Increase Action
    if (action === "increase") {
      if (itemFound.quantity + 1 > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} items left in stock`,
        });
      }
      itemFound.quantity += 1;
    }

    // Handle Decrease Action
    else if (action === "decrease") {
      if (itemFound.quantity - 1 < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be less than 1",
        });
      }
      itemFound.quantity -= 1;
    }

    // Handle Direct Quantity Update (if action is not provided)
    else if (newQuantity) {
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} items left in stock`,
        });
      }
      if (newQuantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be less than 1",
        });
      }
      itemFound.quantity = newQuantity;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action or newQuantity",
      });
    }

    // Mark cart as modified
    user.markModified("cart");

    // Save the updated user document
    await user.save();

    return res.status(200).json({ success: true, itemFound });
  } catch (error) {
    console.log(`Error updating cart item quantity: ${error}`);
    return res.status(500).json({ success: false, error });
  }
};
