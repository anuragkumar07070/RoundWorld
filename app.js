if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();  // IMPORTANT: Define app FIRST

// Then require modules that use app
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");

// Import your modules
const User = require("./models/user");
const Listing = require("./models/listing");
const ExpressError = require("./utils/AppError.js");
const { logRequest } = require("./middleware");

// Routes - import AFTER app is defined
const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require('./routes/user.js');

// Constants
const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLASDB_URL;

// Database connection - define BEFORE using
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Database connected successfully");
    } catch (err) {
        console.error("❌ Database connection error:", err);
        process.exit(1);
    }
}
main();

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Middleware (order matters!)
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Security - simplified for now
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
} else {
    // Development - disable CSP for easier debugging
    app.use(helmet({
        contentSecurityPolicy: false,
    }));
}

// Session store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("Session store error:", err);
});

// Session configuration
const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(logRequest);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currentPath = req.path;
    next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Home route
app.get("/", async (req, res, next) => {
    try {
        const { getAllTags } = require("./utils/tags");
        
        const allListing = await Listing.find()
            .sort({ createdAt: -1 })
            .limit(6);
        
        const allTags = getAllTags();
        
        // Pass ALL variables that the template expects
        res.render("listings/index.ejs", { 
            allListing: allListing,
            search: '',
            activeTag: '',
            allTags: allTags,  // This was missing!
            currUser: req.user
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// 404 handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handler
app.use((err, req, res, next) => {
    console.error("=== ERROR DETAILS ===");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("Path:", req.path);
    console.error("Method:", req.method);
    
    const { statusCode = 500, message = "Something went wrong" } = err;
    
    // In development, show the actual error
    if (process.env.NODE_ENV !== 'production') {
        return res.status(statusCode).send(`
            <h1>Error ${statusCode}</h1>
            <pre>${message}</pre>
            <pre>${err.stack}</pre>
        `);
    }
    
    res.status(statusCode).render("error.ejs", { message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
});