import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

// order.controller.js
const createOrder = async (req, res) => {
  try {
    const { userId, phoneNumber, shippingaddress, items, razorpayOrderId } =
      req.body;

    // Validate required fields
    if (!userId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId or items",
      });
    }

    // Process items
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }
        return {
          product: product._id,
          title: product.title,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );
    console.log("razorpayOrderId", razorpayOrderId);
    // Create order
    const order = await Order.create({
      user: userId,
      rzpId: razorpayOrderId,
      phoneNumber,
      shippingAddress: shippingaddress,
      items: orderItems,
      totalAmount: orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log(error);
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
    const { fullName, email, phoneNumber, address, items } = req.body;

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

    // Format the address into a single string
    const formattedShippingAddress = `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state}, ${address.pinCode}`;

    // Check if the user already exists
    const userExists = await User.findOne({ email });

    let user, newOrder;

    if (userExists) {
      // If the user exists, use the existing user
      user = userExists;
    } else {
      // If the user does not exist, create a new guest user
      user = new User({
        fullName,
        email,
        phoneNumber,
        address,
        isGuest: true, // Mark the user as a guest
      });

      await user.save();
    }

    // Create the order
    newOrder = new Order({
      user: user._id, // Associate the order with the user (existing or new)
      items: orderItems,
      phoneNumber,
      shippingAddress: formattedShippingAddress, // Use the formatted address
      totalAmount,
      paymentStatus: "Success", // Assuming payment is successful for guest checkout
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

const orderControllers = {
  createOrder,
  generateFeatureProducts,
  guestCheckout,
};

export { orderControllers };
