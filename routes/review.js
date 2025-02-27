const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const controllers = require("../controllers/review.js");

//Reviews
router.post("/",isLoggedIn,validateReview, wrapAsync(controllers.createReview));


// Delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(controllers.deleteReview));

module.exports = router;