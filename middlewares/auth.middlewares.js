import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Ensure correct file extension
import dotenv from "dotenv";

dotenv.config(
    {
        path : ".env"
    }
); // Load environment variables

const verifyJWT = async (req, res, next) => {
    try {
        // Retrieve token from cookie or Authorization header
        const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify Token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decodedToken.id || decodedToken._id).select("-password -RefreshToken");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Invalid token." });
        }

        // Attach user to request object
        req.user = user;
        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
    }
};

export default verifyJWT;
