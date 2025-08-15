const Review = require('../models/review.js');
const Listing = require('../models/listings.js');
const ExpressError = require('../utils/CustomError.js');

// Create a new review
module.exports.create = async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, 'Listing not found');
    }
    const new_Review = new Review(req.body);
    listing.reviews.push(new_Review);
    new_Review.author = req.user._id;
    console.log(new_Review.author);
    await new_Review.save();
    await listing.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/Listings/${listing.id}`);
};

// Delete a review
module.exports.delete = async (req, res) => {
    let {id, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull : { reviews : reviewId } });
    req.flash("success", "Review Deleted Successfully");
    res.redirect(`/Listings/${id}`);
};

