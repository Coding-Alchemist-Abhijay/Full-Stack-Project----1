const Listing = require('./models/listings.js');
const Review = require('./models/review.js');
module.exports.loggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session && req.session.redirectUrl) { // if it exists
        res.locals.redirectUrl = req.session.redirectUrl; // since passport automatically resets req.originalUrl; after loggin in or signing up etc. so value becomes undefined so storing it in locals. 
    }
    next();
};

module.exports.saveRedirectUrl = saveRedirectUrl;

const isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/Listings");
    }
    if (!req.user || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/Listings/${id}`);
    }
    next();
};

module.exports.isOwner = isOwner;

const isReviewOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review does not exist");
        return res.redirect(`/Listings/${id}`);
    }
    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/Listings/${id}`);
    }
    next();
};

module.exports.isReviewOwner = isReviewOwner;
