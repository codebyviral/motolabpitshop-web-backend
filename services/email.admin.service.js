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

const adminEmailTemplate = (name, email, customMessage = "") => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message from MotoLab PitShop</title>
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
        @media (max-width: 480px) {
            .benefits {
                flex-direction: column;
            }
            .benefit {
                margin-bottom: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">MotoLab PitShop</div>
    </div>
    <div class="content">
        <h1>Hello, ${name}!</h1>
        
        <p>${customMessage}</p>

        <div class="benefits">
            <div class="benefit">
                <div class="benefit-icon">🚚</div>
                <div>Free Shipping</div>
                <div>in Tamil Nadu</div>
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
        
        <center>
            <a href="https://motolabpitshop.com/shop" class="button">VISIT OUR SHOP</a>
        </center>
    </div>
    <div class="footer">
        <p>This email was sent to ${email}. If you have any questions, please contact our support team at support@motolabpitshop.com</p>
        <p>© 2025 MotoLab PitShop. All rights reserved.</p>
    </div>
</body>
</html>`;

export const sendAdminEmail = async (name, to, subject, messageFromAdmin = "") => {
    try {
        const htmlContent = adminEmailTemplate(name, to, messageFromAdmin);

        await transporter.sendMail({
            from: `MotoLab PitShop <${process.env.NODEMAILER_USER_EMAIL}>`,
            to,
            subject,
            html: htmlContent,
        });

        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};