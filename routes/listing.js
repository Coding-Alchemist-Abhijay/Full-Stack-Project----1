const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true }); // to make sure that req.params work
const Listing = require('../models/listings.js');
const asyncWrap = require('../utils/AsyncWrap.js')
const ExpressError = require('../utils/CustomError.js');
const {listingSchema} = require('../schema.js');
const User = require('../models/user.js');
const { isOwner, loggedIn } = require('../middleware.js');
const listingController = require('../Controllers/listing.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
}
// Remove route handler functions and use controller methods instead
router.get("/", asyncWrap(listingController.index));
router.get("/new", loggedIn, listingController.renderNewForm);
router.get("/:id", asyncWrap(listingController.show));
router.post("/", loggedIn, isOwner, validateListing, asyncWrap(listingController.create));
router.get("/:id/edit", loggedIn, asyncWrap(listingController.renderEditForm));
router.put("/:id", loggedIn, isOwner, validateListing, asyncWrap(listingController.update));
router.delete("/:id", loggedIn, isOwner, asyncWrap(listingController.delete));

module.exports = router;
