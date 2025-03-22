import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.NODEMAILER_USER_EMAIL,
    pass: process.env.NODEMAILER_USER_PASSWORD,
  },
});

const orderConfirmTemplate = (
  name,
  orderNumber,
  orderDate,
  products
) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - MotoLab PitShop</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f7d117; /* Tailwind yellow-400 */
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000;
        }
        .order-info {
            background-color: #ffffff;
            border: 1px solid #e5e7eb; /* Tailwind gray-200 */
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .order-header {
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .product-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #f3f4f6; /* Tailwind gray-100 */
        }
        .product-info {
            flex: 3;
        }
        .product-price {
            flex: 1;
            text-align: right;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            font-weight: bold;
        }
        .summary {
            margin-top: 20px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .button {
            display: inline-block;
            background-color: #000;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 15px;
        }
        .benefits {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin: 20px 0;
            text-align: center;
        }
        .benefit {
            flex: 1;
            padding: 10px;
            min-width: 120px;
            margin-bottom: 10px;
        }
        .benefit-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
            color: #666;
        }
        .shipping-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f3f4f6; /* Tailwind gray-100 */
            border-radius: 5px;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 480px) {
            .benefits {
                flex-direction: column;
            }
            .benefit {
                margin-bottom: 15px;
            }
            .product-row {
                flex-direction: column;
            }
            .product-price {
                text-align: left;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">MotoLab PitShop</div>
    </div>
    <div class="content">
        <h1>Order Confirmation</h1>
        <p>Dear ${name},</p>
        <p>Thank you for your order! We're excited to confirm that your order has been successfully placed and is being processed.</p>
        
        <div class="order-info">
            <div class="order-header">
                Order #${orderNumber} - ${orderDate}
            </div>
            
            <!-- Product details -->
            <div class="product-row">
                <div class="product-info">
                    <strong>Racing Helmet Pro X1</strong>
                    <div>Color: Matte Black | Size: L</div>
                    <div>Qty: 1</div>
                </div>
                <div class="product-price">₹8,999</div>
            </div>
            
            <div class="product-row">
                <div class="product-info">
                    <strong>Riding Gloves - Leather</strong>
                    <div>Color: Brown | Size: M</div>
                    <div>Qty: 1</div>
                </div>
                <div class="product-price">₹1,499</div>
            </div>
            
            <!-- Order summary -->
            <div class="summary">
                <div class="summary-item">
                    <div>Subtotal:</div>
                    <div>₹10,498</div>
                </div>
                <div class="summary-item">
                    <div>Shipping:</div>
                    <div>₹150</div>
                </div>
                <div class="summary-item">
                    <div>Tax (GST):</div>
                    <div>₹1,889.64</div>
                </div>
                <div class="total-row">
                    <div>Total:</div>
                    <div>₹12,537.64</div>
                </div>
            </div>
        </div>
        
        <div class="shipping-info">
            <h3>Shipping Details</h3>
            <p>
                <strong>${name}</strong><br>
                ${address1}<br>
                ${address2}<br>
                ${city}, ${state} ${zipCode}<br>
                ${country}<br>
                Phone: ${phone}
            </p>
            <p><strong>Estimated Delivery:</strong> ${deliveryDate}</p>
        </div>
        
        <p>You will receive another email when your order ships with tracking information.</p>
        
        <div class="benefits">
            <div class="benefit">
                <div class="benefit-icon">🚚</div>
                <div>Free Shipping</div>
                <div>On orders over ₹7,500</div>
            </div>
            <div class="benefit">
                <div class="benefit-icon">↩️</div>
                <div>Easy Returns</div>
                <div>Within 7 days</div>
            </div>
            <div class="benefit">
                <div class="benefit-icon">🔒</div>
                <div>Secure Payment</div>
                <div>100% Secure Online</div>
            </div>
        </div>
        
        <center>
            <a href="https://motolabpitshop.com/order-tracking" class="button">TRACK YOUR ORDER</a>
        </center>
    </div>
    <div class="footer">
        <p>Have questions? Contact our support team at support@motolabpitshop.com or call us at +91-XXXXXXXXXX</p>
        <p>This email was sent to ${email}</p>
        <p>© 2025 MotoLab PitShop. All rights reserved.</p>
    </div>
</body>
</html>`;

export const sendOrderConfirmationEmail = async (
  customerName,
  orderNumber,
  orderDate,
  products,
  to,
  subject
) => {
  try {
    const htmlContent = orderConfirmTemplate(
      customerName,
      orderNumber,
      orderDate,
      products
    );
    await transporter.sendMail({
      from: `MotoLab PitShop <${process.env.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Order confirmation email sent successfully to: ${to}`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};
