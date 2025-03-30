import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

const getOrders = async (req, res) => {
  try {
    // Get all orders with populated user and product data
    const orders = await Order.find()
      .populate("user", "fullName email phoneNumber")
      .populate({
        path: "items.product",
        model: "Product",
        select: "title description price",
      })
      .sort({ placedAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "No orders available",
        success: false,
      });
    }

    // Verify all products exist before formatting
    const verifiedOrders = await Promise.all(
      orders.map(async (order) => {
        const itemsWithVerifiedProducts = await Promise.all(
          order.items.map(async (item) => {
            if (!item.product) {
              const product = await Product.findById(item.product);
              if (product) {
                item.product = product;
              }
            }
            return item;
          })
        );

        return {
          ...order.toObject(),
          items: itemsWithVerifiedProducts,
        };
      })
    );

    // Format the orders for response
    const formattedOrders = verifiedOrders.map((order) => {
      return {
        orderId: order._id, // Include the order ID
        rzpId: order.rzpId, // Include Razorpay order ID if needed
        name: order.user?.fullName || "N/A",
        email: order.user?.email || "N/A",
        phone: order.phoneNumber || order.user?.phoneNumber || "N/A",
        address: order.shippingAddress || "N/A",
        products: order.items.map((item) => ({
          productId: item.product?._id || null, // Include product ID
          name: item.product?.title || "[Deleted Product]",
          description: item.product?.description || "",
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        })),
        paymentStatus: order.paymentStatus || "Pending",
        orderStatus: order.orderStatus || "Pending",
        totalAmount: order.totalAmount,
        orderDate: order.placedAt || order.createdAt,
        expectedDelivery: order.expectedDelivery, // Include expected delivery date
      };
    });

    return res.status(200).json({
      orders: formattedOrders,
      success: true,
    });
  } catch (error) {
    console.error("Error in getOrders:", error);
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (
      !["Pending", "Shipped", "Delivered", "Cancelled"].includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        orderId: updatedOrder._id,
        orderStatus: updatedOrder.orderStatus,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

const adminControllers = { getOrders, updateOrderStatus };

export { adminControllers };
