// ========================== Imports =========================== //
import express from "express";
import { connectToDataBase } from "./config/db.js"
import cors from "cors";
// ========================== Router Imports =========================== //
import adminRouter from "./router/admin-router.js"
import authRouter from "./router/auth-router.js"
import orderRouter from "./router/order-router.js"
import paymentRouter from "./router/payment-router.js"
import Productrouter from "./router/product-router.js"
// ========================== Sessions & Middleware =========================== //
import session from "express-session"
import passport from "passport"
import { Strategy as OAuth2Strategy } from "passport-google-oauth2"
// ========================== DB Models =========================== //
import { User } from "./models/user.model.js"
// ========================== Payment Gateway =========================== //
import Razorpay from 'razorpay';

const app = express();
const port = process.env.PORT || 8000;

const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const devFrontendUrl = process.env.DEV_FRONTEND_URL;

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    method: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization , multipart/form-data"
}

app.use(cors(corsOptions))
app.use(express.json());

// setup session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }
}))
app.use(express.urlencoded());
app.use(express.static("public", { index: false }));

// setup passport

app.use(passport.initialize())
app.use(passport.session())

// ========================== LIST OF ALL APIS ========================== //

app.use("/api/auth", authRouter)
app.use("/api/admin", adminRouter)
app.use("/api/search", orderRouter)
app.use("/api/get", orderRouter)
app.use("/api/order", orderRouter)
app.use("/api/add", Productrouter)

passport.use(
    new OAuth2Strategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: "/auth/google/callback",
        scope: ['profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            try {
                let user = await User.findOne({ googleId: profile.id })

                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value,
                    });
                    await user.save();
                }

                return done(null, user)
            } catch (error) {
                return done(error, null)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user)
})


passport.deserializeUser((user, done) => {
    done(null, user)
})

// ========================== INITIALIZE GOOGLE OAUTH LOGIN ========================== //
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: devFrontendUrl,
    failureRedirect: `${devFrontendUrl}/login`
}))

app.get("/login/success", async (req, res) => {

    if (req.user) {
        res.status(200).json({
            message: "User has logged in",
            user: req.user
        })
    } else {
        res.status(400).json({ message: "Not Authorized" })
    }
})

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        res.redirect(devFrontendUrl);
    })
})

// ========================== RAZORPAY SETUP ========================== //

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

app.use("/api", paymentRouter)

app.get("/", (req, res) => {
    console.log(`Someone said hi to our backend server.`)
    res.send(`This is Motolabpitshop Backend server`)
})

await connectToDataBase().then(() => {
    console.log(`Connecting to mongodatabase...`)
    app.listen(port, () => {
        console.log(`Motolabpitshop Server is running on port: ${port}`)
    })
})