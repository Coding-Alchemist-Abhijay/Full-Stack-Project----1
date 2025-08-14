const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/review.js');
const {reviewSchema} = require('../schema.js');
const asyncWrap = require('../utils/AsyncWrap.js');
const ExpressError = require('../utils/CustomError.js');
const Listing = require('../models/listings.js');

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
}

router.post("/", validateReview, asyncWrap(async(req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    const new_Review = new Review(req.body);
    listing.reviews.push(new_Review);
    await new_Review.save();
    await listing.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/Listings/${listing.id}`);
}))

router.delete("/:reviewId", asyncWrap(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId); // post method triggers and that original id gets deleted from review collection
    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}}); // pull operator deletes matching field from the array so that corresponding reviewId deleted
    req.flash("success", "Review Deleted Successfully");
    res.redirect(`/Listings/${id}`);
}))

module.exports = router;
