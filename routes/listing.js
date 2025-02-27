const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const controllers = require("../controllers/listing.js");

// upload image
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


// index route
router
    .route("/")
    .get(wrapAsync(controllers.index))
    // Create Route
    .post(isLoggedIn,upload.single('listing[image]'),validateListing ,wrapAsync(controllers.createListing));



//New Route
router.get("/new",isLoggedIn,controllers.newForm);

router.route("/:id")
    //Show Route
    .get(wrapAsync(controllers.showListing))

    // Update
    .patch(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(controllers.updateListing))

    //Delete 
    .delete(isLoggedIn,isOwner,wrapAsync(controllers.deleteListing));


// Edit
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(controllers.editListing));


module.exports = router;