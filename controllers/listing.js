const Listing = require("../models/listing");
const { suggestTags } = require("../utils/tags");

module.exports.index = async (req, res) => {
    try {
        let query = {};
        
        if (req.query.search) {
            query = {
                $or: [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { location: { $regex: req.query.search, $options: 'i' } },
                    { country: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }
        
        if (req.query.tag) {
            query.tags = req.query.tag;
        }
        
        const allListing = await Listing.find(query)
            .populate('owner', 'username')
            .sort({ createdAt: -1 });
        
        const { getAllTags } = require("../utils/tags");
        const allTags = getAllTags();
        
        res.render("listings/index.ejs", { 
            allListing,
            search: req.query.search || '',
            activeTag: req.query.tag || '',
            allTags: allTags
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load listings");
        res.redirect("/");
    }
};

module.exports.newForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author", select: "username email" }
            })
            .populate("owner", "username email");
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        // Handle missing owner
        if (!listing.owner) {
            const User = require("../models/user");
            const anyUser = await User.findOne();
            if (anyUser) {
                listing.owner = anyUser;
                await listing.save();
            }
        }
        
        let isOwner = false;
        if (req.user && listing.owner) {
            isOwner = req.user._id.equals(listing.owner._id);
        }
        
        res.render("listings/show.ejs", { 
            listing: listing,
            isOwner: isOwner
        });
        
    } catch (err) {
        console.error("Show listing error:", err);
        if (err.name === 'CastError') {
            req.flash("error", "Invalid listing ID");
            return res.redirect("/listings");
        }
        next(err);
    }
};

module.exports.getListingsByTag = async (req, res, next) => {
    try {
        const { tag } = req.params;
        const { getAllTags } = require("../utils/tags");
        
        const listings = await Listing.find({ tags: tag })
            .populate('owner', 'username')
            .sort({ createdAt: -1 });
        
        const allTags = getAllTags();
        
        res.render("listings/index.ejs", {
            allListing: listings,
            activeTag: tag,
            allTags: allTags,
            search: ''
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to filter listings");
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            req.flash("error", "You must be logged in");
            return res.redirect("/login");
        }
        
        let listing = new Listing(req.body.listing);
        
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        
        if (req.body.tags) {
            listing.tags = Array.isArray(req.body.tags) 
                ? req.body.tags 
                : [req.body.tags];
        } else {
            listing.tags = suggestTags(listing);
        }
        
        listing.owner = req.user._id;
        await listing.save();
        
        req.flash("success", "✨ New listing created!");
        res.redirect(`/listings/${listing._id}`);
        
    } catch (err) {
        console.error("Create listing error:", err);
        req.flash("error", err.message);
        res.redirect("/listings/new");
    }
};

module.exports.editListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to edit listing");
        res.redirect("/listings");
    }
};

module.exports.updateListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const updateData = { ...req.body.listing };
        
        if (req.body.tags) {
            updateData.tags = Array.isArray(req.body.tags) 
                ? req.body.tags 
                : [req.body.tags];
        }
        
        const listing = await Listing.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });
        
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            await listing.save();
        }
        
        req.flash("success", "✅ Listing updated!");
        res.redirect(`/listings/${listing._id}`);
        
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to update listing");
        res.redirect(`/listings/${req.params.id}/edit`);
    }
};

module.exports.deleteListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        
        req.flash("success", "Listing deleted!");
        res.redirect("/listings");
        
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to delete listing");
        res.redirect("/listings");
    }
};