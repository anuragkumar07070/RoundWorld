const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async(req,res,next)=>{

    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("Review added");
    
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    let review = await Review.findByIdAndDelete(reviewId);

    console.log(listing);
    console.log(review);
 
    res.redirect(`/listings/${listing._id}`);

}