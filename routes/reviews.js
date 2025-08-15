const express = require('express');
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require('../schema.js');
const asyncWrap = require('../utils/AsyncWrap.js');
const ExpressError = require('../utils/CustomError.js');
const { isReviewOwner, loggedIn } = require('../middleware.js');
const reviewController = require('../Controllers/reviews.js');

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

// Handle accidental GET to reviews root (e.g., after login redirect)
router.get("/", (req, res) => {
    return res.redirect(`/Listings/${req.params.id}`);
});

router.post("/", loggedIn, validateReview, asyncWrap(reviewController.create));
router.delete("/:reviewId", isReviewOwner, asyncWrap(reviewController.delete));

module.exports = router;
