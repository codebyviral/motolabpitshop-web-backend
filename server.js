import express from "express";
import { connectToDataBase } from "./config/db.js";
import cors from "cors";
import adminRouter from "./router/admin-router.js";
import authRouter from "./router/auth-router.js";
import orderRouter from "./router/order-router.js";
import dotenv from "dotenv";
import Productrouter from "./router/product-router.js";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";
import { User } from "./models/user.model.js";

// Load environment variables
dotenv.config({ path: ".env" });

const app = express();
const port = process.env.PORT || 8000;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const devFrontendUrl = process.env.DEV_FRONTEND_URL;

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
    credentials: true, // Allow credentials (cookies)
    allowedHeaders: ["Content-Type", "Authorization", "multipart/form-data"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "none" for cross-origin in production
        },
    })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth2 strategy
passport.use(
    new OAuth2Strategy(
        {
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: "/auth/google/callback",
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value,
                    });
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Passport serialization/deserialization
passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize user by ID
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Fetch user from database
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.user = req.session.passport.user;
        return next();
    } else {
        return res.status(401).json({ message: "Not Authorized" });
    }
};

// Google OAuth login routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: devFrontendUrl,
        failureRedirect: `${devFrontendUrl}/login`,
    }),
    (req, res) => {
        console.log("User authenticated:", req.user);
        console.log("Session data:", req.session);
        res.redirect(devFrontendUrl);
    }
);

// Login success route
app.get("/login/success", isAuthenticated, async (req, res) => {
    console.log(`Session ID: ${req.sessionID}`);
    console.log(`Session data: ${JSON.stringify(req.session)}`);
    console.log(`User data: ${JSON.stringify(req.user)}`);

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.status(200).json({
                message: "User has logged in",
                user: user,
            });
        } else {
            res.status(400).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Logout route
app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect(devFrontendUrl);
    });
});

// Default route
app.get("/", (req, res) => {
    res.send(`This is Motolabpitshop Backend server`);
});

// Connect to database and start server
connectToDataBase().then(() => {
    app.listen(port, () => {
        console.log(`Motolabpitshop Server is running on port: ${port}`);
    });
});