const Review = require("../models/review");
const Listing = require("../models/listing");
const AppError = require("../utils/AppError");
const { validateId } = require("../utils/validators");

module.exports.createReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!validateId(id)) {
            return next(new AppError(400, "Invalid listing ID"));
        }
        
        const { rating, comment } = req.body.review;
        if (!rating || !comment || comment.length < 5) {
            req.flash("error", "Rating and comment (min 5 characters) are required");
            return res.redirect(`/listings/${id}`);
        }
        
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        const newReview = new Review({
            rating: Number(rating),
            comment: comment.trim(),
            author: req.user._id
        });
        
        listing.reviews.push(newReview);
        
        await newReview.save();
        await listing.save();
        
        req.flash("success", "Review added successfully!");
        res.redirect(`/listings/${listing._id}`);
        
    } catch (err) {
        next(err);
    }
};

module.exports.deleteReview = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        
        if (!validateId(id) || !validateId(reviewId)) {
            return next(new AppError(400, "Invalid ID format"));
        }
        
        await Listing.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId }
        });
        
        await Review.findByIdAndDelete(reviewId);
        
        req.flash("success", "Review deleted successfully!");
        res.redirect(`/listings/${id}`);
        
    } catch (err) {
        next(err);
    }
};

// Add this missing function
module.exports.getListingReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        if (!validateId(id)) {
            return next(new AppError(400, "Invalid listing ID"));
        }
        
        const reviews = await Review.find({ listing: id })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Review.countDocuments({ listing: id });
        
        // For API responses (if needed)
        if (req.xhr || req.headers.accept === 'application/json') {
            return res.json({
                success: true,
                data: reviews,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalReviews: total
                }
            });
        }
        
        // For regular HTML requests, just redirect
        res.redirect(`/listings/${id}`);
        
    } catch (err) {
        next(err);
    }
};