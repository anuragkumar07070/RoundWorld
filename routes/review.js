const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");  // Fix import path
const controllers = require("../controllers/review");

// Create review
router.post("/", isLoggedIn, validateReview, wrapAsync(controllers.createReview));

// Delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(controllers.deleteReview));

// Get reviews with pagination (API endpoint for AJAX)
router.get("/", wrapAsync(controllers.getListingReviews));

module.exports = router;