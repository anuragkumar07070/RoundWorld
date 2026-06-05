const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const AppError = require("../utils/AppError");
const { validateId } = require("../utils/validators");

module.exports.renderSignUp = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            throw new AppError(400, "All fields are required");
        }
        
        if (password.length < 6) {
            req.flash("error", "Password must be at least 6 characters");
            return res.redirect("/signup");
        }
        
        const newUser = new User({ 
            username: username.trim(), 
            email: email.toLowerCase().trim() 
        });
        
        const registeredUser = await User.register(newUser, password);
        
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to RoundWorld!");
            res.redirect("/listings");
        });
        
    } catch (err) {
        if (err.name === 'UserExistsError') {
            req.flash("error", "Username already exists");
            return res.redirect("/signup");
        }
        next(err);
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.loginAuthentication = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
};

// Add these missing functions
module.exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.params.id || req.user._id;
        
        if (!validateId(userId)) {
            return next(new AppError(400, "Invalid user ID"));
        }
        
        const user = await User.findById(userId).select('-hash -salt');
        
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/listings");
        }
        
        // Get user's listings
        const listings = await Listing.find({ owner: userId })
            .sort({ createdAt: -1 })
            .limit(6);
        
        // Get user's reviews
        const reviews = await Review.find({ author: userId })
            .populate('listing', 'title')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.render("users/profile.ejs", {
            profileUser: user,
            listings,
            reviews,
            isOwnProfile: req.user && req.user._id.equals(userId)
        });
        
    } catch (err) {
        next(err);
    }
};

module.exports.updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        
        const updates = {};
        if (username) updates.username = username.trim();
        if (email) updates.email = email.toLowerCase().trim();
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );
        
        req.flash("success", "Profile updated successfully!");
        res.redirect(`/user/${req.user._id}`);
        
    } catch (err) {
        if (err.code === 11000) {
            req.flash("error", "Username or email already taken");
            return res.redirect("/user/profile");
        }
        next(err);
    }
};