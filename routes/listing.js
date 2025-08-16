const express = require('express');
const router = express.Router({ mergeParams: true }); // to make sure that req.params work
const Listing = require('../models/listings.js');
const asyncWrap = require('../utils/AsyncWrap.js');
const ExpressError = require('../utils/CustomError.js');
const { listingSchema } = require('../schema.js');
const User = require('../models/user.js');
const { isOwner, loggedIn } = require('../middleware.js');
const listingController = require('../Controllers/listing.js');
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

// Home listings
router.route("/")
    .get(asyncWrap(listingController.index))
    .post(
        loggedIn,
        upload.single('listing[image]'),
        validateListing,
        asyncWrap(listingController.create)
    )

// New listing form
router.route("/new")
    .get(loggedIn, listingController.renderNewForm);

// Edit listing form
router.route("/:id/edit")
    .get(loggedIn, asyncWrap(listingController.renderEditForm));

// Single listing show, update, delete
router.route("/:id")
    .get(asyncWrap(listingController.show))
    .put(
        loggedIn,
        isOwner,
        validateListing,
        asyncWrap(listingController.update)
    )
    .delete(
        loggedIn,
        isOwner,
        asyncWrap(listingController.delete)
    );

module.exports = router;
