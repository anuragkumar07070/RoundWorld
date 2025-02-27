const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;  // redirect url
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}


module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// owner 
module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    console.log(listing);

    if (!listing || !listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error","You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Only author can delete his review 
module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id} = req.params;
    let {reviewId} = req.params;
    let review = await Review.findById(reviewId);

    if (!review || !review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error","You can't delete other reviews");
        return res.redirect(`/listings/${id}`);
    }
    next();
};



// Validate listingSchema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errorMsg);
    }
    next();
};

// Validate reviewSchema
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errorMsg =  error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errorMsg);
    }else{
        next();
    }
}