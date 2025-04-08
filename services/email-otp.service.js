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

const otpEmailTemplate = (name, email, otp) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code - MotoLab PitShop</title>
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
        .otp-container {
            margin: 25px 0;
            text-align: center;
        }
        .otp-code {
            font-size: 32px;
            letter-spacing: 8px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
            border: 1px dashed #ccc;
        }
        .security-note {
            background-color: #fffde7;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #f7d117;
            margin: 20px 0;
            font-size: 14px;
        }
        .expiry-note {
            text-align: center;
            margin: 15px 0;
            font-size: 14px;
            color: #e53935;
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
        .footer {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
            color: #666;
        }
        @media (max-width: 480px) {
            .otp-code {
                font-size: 24px;
                letter-spacing: 6px;
                padding: 10px;
            }
            .security-note {
                padding: 8px;
            }
            .button {
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">MotoLab PitShop</div>
    </div>
    <div class="content">
        <h1>Verification Code</h1>
        <p>Hello ${name},</p>
        <p>Please use the following verification code to complete your account verification process:</p>
        
        <div class="otp-container">
            <div class="otp-code">${otp}</div>
        </div>
        
        <div class="expiry-note">
            This code will expire in 5 minutes.
        </div>
        
        <div class="security-note">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email or contact support immediately. Never share this code with anyone.
        </div>
        
        <p>Once verified, you'll have full access to your MotoLab PitShop account and can start shopping for premium motorcycle parts, accessories, and apparel.</p>
    </div>
    <div class="footer">
        <p>This email was sent to ${email}. If you have any questions, please contact our support team at support@motolabpitshop.com</p>
        <p>© 2025 MotoLab PitShop. All rights reserved.</p>
    </div>
</body>
</html>`;

export const sendOtpEmail = async (name, to, otp) => {
  try {
    const subject = "Your Verification Code - MotoLab PitShop";
    const htmlContent = otpEmailTemplate(name, to, otp);

    await transporter.sendMail({
      from: `MotoLab PitShop <${process.env.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("OTP email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
