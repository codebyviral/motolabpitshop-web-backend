import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport(
    {
        secure: true,
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "motolabpitshop@gmail.com",
            pass: "ovymisfdpsazybqw"
        }
    }
)

function sendMail(to, sub, msg) {
    transporter.sendMail({
        to,
        subject: sub,
        html: msg,
    });

    console.log("Email Sent")
}

sendMail("motolabpitshop@gmail.com", "sub", "boom")