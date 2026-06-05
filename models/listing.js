const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        filename: {
            type: String,
            default: 'listingimage',
        },
        url: {
            type: String,
            default: 'https://images.unsplash.com/photo-1735675376752-2e0fb3de9f69',
        },
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    location: String,
    country: String,
    
    // NEW: Tags field
    tags: [{
        type: String,
        enum: ['beach', 'mountain', 'desert', 'forest', 'lake', 'city', 
               'countryside', 'luxury', 'budget', 'family', 'romantic', 
               'adventure', 'ski', 'tropical', 'historical', 'modern'],
    }],
    
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }],
    
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;