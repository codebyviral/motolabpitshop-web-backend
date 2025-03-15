// Main Server File
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";
import { connectToDataBase } from "./config/db.js";
import adminRouter from "./router/admin-router.js";
import authRouter from "./router/auth-router.js";
import orderRouter from "./router/order-router.js";
import { User } from "./models/user.model.js";

// --------------------------
// Environment Variables
// --------------------------
const port = process.env.PORT || 8000;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const devFrontendUrl = process.env.DEV_FRONTEND_URL;
const sessionSecret = process.env.SESSION_SECRET || "19ghvbd4n3hd78chdfg43hsu";

// --------------------------
// App Configuration
// --------------------------
const app = express();

// CORS Configuration
const corsOptions = {
    origin: [devFrontendUrl],
    method: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization"
};
app.use(cors(corsOptions));
app.use(express.json());

// Session Configuration
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
}));

// --------------------------
// Passport Configuration
// --------------------------
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy
passport.use(
    new OAuth2Strategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: "/auth/google/callback",
        scope: ['profile', 'email']
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
    })
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// --------------------------
// API Routes
// --------------------------
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/order", orderRouter);

// --------------------------
// Auth Routes
// --------------------------
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: devFrontendUrl,
    failureRedirect: `${devFrontendUrl}/login`
}));

app.get("/login/success", async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "User has logged in",
            user: req.user
        });
    } else {
        res.status(400).json({ message: "Not Authorized" });
    }
});

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect(devFrontendUrl);
    });
});

// --------------------------
// Root Route
// --------------------------
app.get("/", (req, res) => {
    res.send(`This is Motolabpitshop Backend server`);
});

// --------------------------
// Server Initialization
// --------------------------
const startServer = async () => {
    try {
        await connectToDataBase();
        app.listen(port, () => {
            console.log(`Motolabpitshop Server is running on port: ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();