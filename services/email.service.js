import nodemailer from "nodemailer";

// Move this to environment variables (.env) in production
const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "motolabpitshop@gmail.com",
        pass: "ovymisfdpsazybqw",
    },
});

const welcomeTemplate = (name, email) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to MotoLab PitShop!</title>
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
        .benefits {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            text-align: center;
        }
        .benefit {
            flex: 1;
            padding: 10px;
        }
        .benefit-icon {
            font-size: 24px;
            margin-bottom: 10px;
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
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">MotoLab PitShop</div>
    </div>
    <div class="content">
        <h1>Welcome, ${name}!</h1>
        <p>Thanks for joining MotoLab PitShop, your one-stop destination for premium motorcycle parts, accessories, and apparel.</p>
        <p>We've created an account for you with the email: <strong>${email}</strong></p>
        <div class="benefits">
            <div class="benefit">
                <div class="benefit-icon">🚚</div>
                <div>Free Shipping</div>
                <div>On orders over $100</div>
            </div>
            <div class="benefit">
                <div class="benefit-icon">↩️</div>
                <div>Easy Returns</div>
                <div>Within 30 days</div>
            </div>
            <div class="benefit">
                <div class="benefit-icon">🔒</div>
                <div>Secure Payment</div>
                <div>100% Secure Online</div>
            </div>
        </div>
        <p>Get ready to experience high-quality gear designed for riders who demand the best.</p>
        <center>
            <a href="https://motolabpitshop.com/shop" class="button">SHOP NOW</a>
        </center>
    </div>
    <div class="footer">
        <p>This email was sent to ${email}. If you have any questions, please contact our support team at support@motolabpitshop.com</p>
        <p>© 2025 MotoLab PitShop. All rights reserved.</p>
    </div>
</body>
</html>`;

export const sendWelcomeEmail = async (name, to, subject) => {
    try {
        const htmlContent = welcomeTemplate(name, to); // Generate the HTML
        console.log("Generated HTML:", htmlContent.substring(0, 200)); // Debug: Log first 200 chars of HTML

        await transporter.sendMail({
            from: '"MotoLab PitShop" <motolabpitshop@gmail.com>', // Add a 'from' field
            to,
            subject,
            html: htmlContent,
        });
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Let the caller handle the error
    }
};