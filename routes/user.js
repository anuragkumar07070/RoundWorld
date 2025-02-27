const express = require('express');
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const controllers = require("../controllers/user");


 
router.route("/signup")
    .get( controllers.renderSignUp)
    .post(wrapAsync(controllers.signup));

router.route("/login")
    // Login
    .get(controllers.renderLogin)
    // Authenication  Login
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), wrapAsync(controllers.loginAuthentication));

// Logout
router.get("/logout",controllers.logout);

module.exports = router;
