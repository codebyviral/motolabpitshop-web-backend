import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import bcrypt from "bcryptjs";

// order.controller.js
const createOrder = async (req, res) => {
  try {
    let {
      userId,
      phoneNumber,
      shippingaddress,
      items,
      deliveryCharge,
      razorpayOrderId,
    } = req.body;

    // 🔥 Fix: Normalize items to always be an array
    if (!Array.isArray(items)) {
      if (typeof items === "object" && items !== null) {
        items = [items];
      } else {
        return res.status(400).json({
          success: false,
          message: "Items should be an array or a valid object.",
        });
      }
    }

    // ❗Validate required fields
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId or items",
      });
    }

    // 🔍 Process each item
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        // 👇 If price is not provided in item, fall back to product.price
        const price = item.price ?? product.price;

        if (typeof price !== "number") {
          throw new Error(
            `Invalid or missing price for item: ${product.title}`
          );
        }

        return {
          product: product._id,
          title: product.title,
          quantity: item.quantity || 1,
          price,
        };
      })
    );
    const totalAmount =
      deliveryCharge +
      orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // ✅ Create order
    const order = await Order.create({
      user: userId,
      rzpId: razorpayOrderId,
      phoneNumber,
      shippingAddress: shippingaddress,
      items: orderItems,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("🔥 Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating order",
    });
  }
};

const generateFeatureProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const getRandomProducts = (arr) =>
      arr.sort(() => 0.5 - Math.random()).slice(0, 4);
    const featuredProducts = getRandomProducts(products);
    return res.status(200).json({ success: true, featuredProducts });
  } catch (error) {
    console.log(`Error generating featured products: ${error}`);
    return res.status(500).json({ error });
  }
};

const guestCheckout = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, address, items, isFreeDelivery } =
      req.body;
    console.log(`Address from frontend: ${JSON.stringify(address)}`);

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
        return res
          .status(404)
          .json({ message: `Product with ID ${item.product} not found` });
      }

      orderItems.push({
        product: product._id,
        title: product.title,
        images: product.images,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    const deliveryCharge = isFreeDelivery ? 0 : 150;
    totalAmount += deliveryCharge;

    // The address is already formatted in the frontend, so use it directly
    const shippingAddress = address;

    // Check if the user already exists
    const userExists = await User.findOne({ email });

    let user, newOrder;

    if (userExists) {
      // If the user exists, use the existing user
      user = userExists;
    } else {
      const hashed_password = await bcrypt.hash(password, 10);
      // If the user does not exist, create a new guest user
      user = new User({
        fullName,
        email,
        password: hashed_password,
        phoneNumber,
        address: [{ addressLine1: shippingAddress }], // Store the address in the user's address array
        isGuest: true, // Mark the user as a guest
      });

      await user.save();
    }

    // Create the order
    newOrder = new Order({
      user: user._id, // Associate the order with the user (existing or new)
      items: orderItems,
      phoneNumber,
      shippingAddress: shippingAddress, // Use the address directly
      totalAmount,
      paymentStatus: "Pending", // Assuming payment is successful for guest checkout
      orderStatus: "Pending",
    });

    await newOrder.save();

    // Push the new order into the user's orders array
    user.orders.push({ orderId: newOrder._id });
    await user.save();

    res.status(201).json({
      message: "Guest checkout successful",
      user,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error during guest checkout:", error);
    res.status(500).json({
      msg: "Error creating guest order",
      error: error.message, // Include the error message for debugging
    });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.query.userId;

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const ordersFound = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "title images price", // Only get these fields from Product
      })
      .sort({ placedAt: -1 }); // Sort by newest orders first

    if (!ordersFound || ordersFound.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders placed",
        userOrders: [],
      });
    }

    // Process all orders and their items
    const userOrders = [];

    ordersFound.forEach((order) => {
      // Create a map to combine same products in this order
      const productMap = new Map();

      order.items.forEach((item) => {
        // Skip if product is null (product may have been deleted)
        if (!item.product) {
          return;
        }

        const productId = item.product._id.toString();
        const existingItem = productMap.get(productId);

        if (existingItem) {
          // If product already exists in this order, update quantity and price
          existingItem.quantity += item.quantity;
          existingItem.price += item.price;
        } else {
          // Use the first image as the main image, or empty string if no images
          const mainImage =
            item.product.images?.length > 0 ? item.product.images[0] : "";

          productMap.set(productId, {
            image: mainImage,
            productId: item.product._id,
            title: item.product.title,
            quantity: item.quantity,
            price: item.price,
            orderId: order._id,
            orderStatus: order.orderStatus,
            placedAt: order.placedAt,
          });
        }
      });

      // Add all unique products from this order to userOrders
      productMap.forEach((item) => {
        userOrders.push(item);
      });
    });

    return res.status(200).json({
      success: true,
      userOrders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      error: `Error fetching user orders: ${error.message}`,
    });
  }
};

const getOrderStatus = async (req, res) => {
  const orderId = req.query.orderId;
  try {
    if (!orderId)
      return res
        .status(404)
        .json({ success: false, error: "Order ID is required." });

    const orderDetails = await Order.findById(orderId).lean();
    if (!orderDetails)
      return res
        .status(400)
        .json({ success: false, message: "No Order details found" });

    // Fetch product details for each item in the order
    const itemsWithProductDetails = await Promise.all(
      orderDetails.items.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          ...item,
          productDetails: {
            title: product?.title,
            description: product?.description,
            price: product?.price,
            images: product?.images,
            rating: product?.rating,
            size: product?.size,
            category: product?.category,
          },
        };
      })
    );

    // Create a new order object with the enhanced items
    const orderWithProductDetails = {
      ...orderDetails,
      items: itemsWithProductDetails,
    };

    return res.status(200).json({ orderDetails: orderWithProductDetails });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error fetching order details: ${error.message}`,
    });
  }
};

const orderControllers = {
  createOrder,
  generateFeatureProducts,
  guestCheckout,
  getUserOrders,
  getOrderStatus,
};

export { orderControllers };
