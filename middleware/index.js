const Listing = require("../models/listing");
const Review = require("../models/review");
const AppError = require("../utils/AppError");
const { listingSchema, reviewSchema } = require("../schema.js");

// Authentication middleware
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please login to continue");
        return res.redirect("/login");
    }
    next();
};

// Save redirect URL after login
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

// Check if user is listing owner
module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You don't have permission to do that");
            return res.redirect(`/listings/${id}`);
        }
        
        next();
    } catch (err) {
        next(err);
    }
};

// Check if user is review author
module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect("back");
        }
        
        if (!review.author.equals(req.user._id)) {
            req.flash("error", "You didn't write this review");
            return res.redirect("back");
        }
        
        next();
    } catch (err) {
        next(err);
    }
};

// Validation middleware
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(", ");
        req.flash("error", errorMsg);
        
        if (req.method === "POST") {
            return res.redirect("/listings/new");
        } else if (req.method === "PATCH") {
            return res.redirect(`/listings/${req.params.id}/edit`);
        }
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(", ");
        req.flash("error", errorMsg);
        return res.redirect(`/listings/${req.params.id}`);
    }
    next();
};

// Request logging middleware
module.exports.logRequest = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
};