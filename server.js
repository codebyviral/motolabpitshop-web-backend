import express from "express";
import { connectToDataBase } from "./config/db.js"
import cors from "cors";
import adminRouter from "./router/admin-router.js"
import authRouter from "./router/auth-router.js"
import orderRouter from "./router/order-router.js"
import session from "express-session"
import passport from "passport"
import { Strategy as OAuth2Strategy } from "passport-google-oauth2"
import { User } from "./models/user.model.js"

const app = express();
const port = 8000;

const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const devFrontendUrl = process.env.DEV_FRONTEND_URL;

const corsOptions = {
    origin: [devFrontendUrl],
    method: "GET, POST, DELETE, PATCH, HEAD, PUT",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization"
}

app.use(cors(corsOptions))
app.use(express.json());

////////////////////////////////
//////LIST OF ALL APIS /////////
////////////////////////////////

app.use("/api/auth", authRouter)
app.use("/api/admin", adminRouter)
app.use("/api/order", orderRouter)

// setup session
app.use(session({
    secret: "19ghvbd4n3hd78chdfg43hsu",
    resave: false,
    saveUninitialized: true,
}))

// setup passport

app.use(passport.initialize())
app.use(passport.session())

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

// initialize google oauth login
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

app.get("/", (req, res) => {
    res.send(`This is Motolabpitshop Backend server`)
})

connectToDataBase().then(() => {
    app.listen(port, () => {
        console.log(`Motolabpitshop Server is running on port: ${port}`)
    })
})