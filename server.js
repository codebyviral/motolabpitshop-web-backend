import express from "express";
import { connectToDataBase } from "./config/db.js";
import cors from "cors";
import adminRouter from "./router/admin-router.js";
import authRouter from "./router/auth-router.js";
import orderRouter from "./router/order-router.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";
import { User } from "./models/user.model.js";

const app = express();
const port = process.env.PORT || 8000;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const devFrontendUrl = process.env.DEV_FRONTEND_URL;
const prodFrontendUrl = process.env.PROD_FRONTEND_URL || "https://motolab-frontend.vercel.app";

const corsOptions = {
    origin: [devFrontendUrl, prodFrontendUrl], // Allow both dev and prod frontend URLs
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT", // Fixed typo: "method" -> "methods"
    credentials: true,
    allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

////////////////////////////////
//////LIST OF ALL APIS /////////
////////////////////////////////

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/order", orderRouter);

// Setup session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI, // Ensure this matches your env variable
            collectionName: "sessions",
        }),
        cookie: {
            secure: process.env.NODE_ENV === "production", // True in production (HTTPS)
            sameSite: "None", // Required for cross-origin in production
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy(
        {
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: `${process.env.NODE_ENV === "production"
                    ? "https://motolabpitshop-backend.onrender.com"
                    : "http://localhost:8000"
                }/auth/google/callback`,
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile);
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

passport.serializeUser((user, done) => {
    done(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Fetch user from DB using ID
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Initialize Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: process.env.NODE_ENV === "production" ? prodFrontendUrl : devFrontendUrl,
        failureRedirect: `${process.env.NODE_ENV === "production" ? prodFrontendUrl : devFrontendUrl
            }/login`,
    })
);

app.get("/login/success", async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "User has logged in",
            user: req.user,
        });
    } else {
        res.status(400).json({ message: "Not Authorized" });
    }
});

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect(process.env.NODE_ENV === "production" ? prodFrontendUrl : devFrontendUrl);
    });
});

app.get("/", (req, res) => {
    res.send(`This is Motolabpitshop Backend server`);
});

connectToDataBase().then(() => {
    app.listen(port, () => {
        console.log(`Motolabpitshop Server is running on port: ${port}`);
    });
});