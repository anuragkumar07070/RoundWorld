const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl, isLoggedIn } = require('../middleware');  // Add isLoggedIn here
const controllers = require("../controllers/user");

// Signup routes
router
    .route("/signup")
    .get(controllers.renderSignUp)
    .post(wrapAsync(controllers.signup));

// Login routes
router
    .route("/login")
    .get(controllers.renderLogin)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", { 
            failureRedirect: '/login', 
            failureFlash: true 
        }),
        wrapAsync(controllers.loginAuthentication)
    );

// Logout route
router.get("/logout", controllers.logout);

// Profile routes (make sure controllers.getProfile and controllers.updateProfile exist)
router.get("/profile", isLoggedIn, wrapAsync(controllers.getProfile));
router.get("/user/:id", wrapAsync(controllers.getProfile));
router.put("/profile", isLoggedIn, wrapAsync(controllers.updateProfile));

module.exports = router;