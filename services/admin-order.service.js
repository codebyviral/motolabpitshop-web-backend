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

const newOrderAdminTemplate = (
  orderNumber,
  customerName,
  customerEmail
) => `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - MotoLab PitShop</title>
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
              background-color: #f7d117;
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
          .order-container {
              margin: 25px 0;
              text-align: center;
          }
          .order-number {
              font-size: 24px;
              font-weight: bold;
              color: #000;
              margin-bottom: 10px;
          }
          .order-date {
              color: #666;
              font-size: 16px;
          }
          .info-box {
              background-color: #fff;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #f7d117;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              background-color: #000;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 15px 0;
          }
          .footer {
              margin-top: 20px;
              font-size: 12px;
              text-align: center;
              color: #666;
          }
          @media (max-width: 480px) {
              .info-box {
                  padding: 10px;
              }
              .button {
                  width: 100%;
                  text-align: center;
                  box-sizing: border-box;
              }
          }
      </style>
  </head>
  <body>
      <div class="header">
          <div class="logo">MotoLab PitShop</div>
      </div>
      <div class="content">
          <h1>New Order Notification</h1>
          <p>A new order has been placed on your website.</p>
          
          <div class="order-container">
              <div class="order-number">Order #${orderNumber}</div>
              <div class="order-date">${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</div>
          </div>
          
          <div class="info-box">
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
          </div>
          
          <center>
              <a href="https://motolabpitshop.vercel.app/admin/orders" class="button">VIEW ORDER IN ADMIN PANEL</a>
          </center>
          
          <p>Please process this order at your earliest convenience.</p>
      </div>
      <div class="footer">
          <p>This is an automated notification sent to administrators.</p>
          <p>© ${new Date().getFullYear()} MotoLab PitShop. All rights reserved.</p>
      </div>
  </body>
  </html>`;

export const sendNewOrderAdminEmail = async (
  orderNumber,
  customerName,
  customerEmail,
  adminEmail = process.env.ADMIN_EMAIL,
  subject = `New Order #${orderNumber} - MotoLab PitShop`
) => {
  try {
    const htmlContent = newOrderAdminTemplate(
      orderNumber,
      customerName,
      customerEmail
    );

    await transporter.sendMail({
      from: `MotoLab PitShop <${process.env.NODEMAILER_USER_EMAIL}>`,
      to: adminEmail,
      subject,
      html: htmlContent,
    });
    console.log("New order admin notification sent to:", adminEmail);
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    throw error;
  }
};