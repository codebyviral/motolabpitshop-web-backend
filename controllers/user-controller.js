import express from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";

export const getUserById = async (req, res) => {
  try {
    // get userId
    const userId = req.query.user;
    if (!userId)
      return res
        .status(404)
        .json({ success: false, msg: "User ID is required" });
    // search in user model
    const userFound = await User.findById(userId);
    // return user
    return res.status(200).json({
      success: true,
      msg: "User Found",
      userFound,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserCart = async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });

    // Fetch user and select cart field
    const user = await User.findById(userId).select("cart");
    if (!user || user.cart.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No items in cart",
      });
    }

    // Extract product IDs and map them to their quantity
    const cartItemsMap = user.cart.reduce((acc, item) => {
      acc[item.productId.toString()] = item.quantity; // Store quantity with productId as key
      return acc;
    }, {});

    // Fetch products based on IDs
    const products = await Product.find({
      _id: { $in: Object.keys(cartItemsMap) },
    });

    // Merge product details with quantity
    const itemsWithQuantity = products.map((product) => ({
      ...product.toObject(), // Convert Mongoose document to a plain object
      quantity: cartItemsMap[product._id.toString()],
    }));

    return res.status(200).json({
      success: true,
      items: itemsWithQuantity,
      message: "Cart Items fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching cart items of user",
      error,
    });
  }
};

export const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Find the product
    const productToAdd = await Product.findById(productId).select("_id");
    if (!productToAdd) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(`Product to be added is: ${productToAdd}`);

    // Find the user with their cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the product already exists in the cart
    const existingCartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItemIndex !== -1) {
      // Product exists in cart, increment quantity
      user.cart[existingCartItemIndex].quantity += quantity;
    } else {
      // Product doesn't exist in cart, add it
      user.cart.push({ productId: productToAdd._id, quantity });
    }

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message:
        existingCartItemIndex !== -1
          ? "Item quantity updated in cart"
          : "Item added to cart successfully",
      success: true,
      product: productToAdd,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    // get user and product id
    const { user, product } = req.query;
    if (!user || !product) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }
    // search product inside cart and delete it
    const updatedUser = await User.findByIdAndUpdate(
      user,
      {
        $pull: {
          cart: { productId: product },
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart: updatedUser.cart, // Return updated cart
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: "false",
      message: "Error deleting item from user's cart",
    });
  }
};

export const getAddress = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(404).json({
      success: false,
      error: "User ID not retireved",
      message: "USER ID is Required",
    });
  }
  try {
    const userAddress = await User.findById(userId).select("address");
    if (!userAddress)
      return res.status(404).json({
        success: false,
        message: "User has not added address yet!",
      });
    return res.status(200).json({
      success: true,
      address: userAddress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error,
      message: "Error getting user's address",
    });
  }
};
