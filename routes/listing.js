const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const controllers = require("../controllers/listing");

// Multer for image upload
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

// Simple auth middleware
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please login to continue");
        return res.redirect("/login");
    }
    next();
};

// Index and Create routes
router
    .route("/")
    .get(wrapAsync(controllers.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        wrapAsync(controllers.createListing)
    );

// New route
router.get("/new", isLoggedIn, controllers.newForm);

// Show route
router.get("/:id", wrapAsync(controllers.showListing));

// Tag filter route
router.get("/tags/:tag", wrapAsync(controllers.getListingsByTag));

// Edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(controllers.editListing));

// Update route
router.patch("/:id", 
    isLoggedIn, 
    upload.single('listing[image]'),
    wrapAsync(controllers.updateListing)
);

// Delete route
router.delete("/:id", isLoggedIn, wrapAsync(controllers.deleteListing));

module.exports = router;