const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true }); // to make sure that req.params work
const Listing = require('../models/listings.js');
const asyncWrap = require('../utils/AsyncWrap.js')
const ExpressError = require('../utils/CustomError.js');
const {listingSchema} = require('../schema.js');
const User = require('../models/user.js');
const isLoggedIn = require('../middleware.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
}

router.get("/", asyncWrap(async(req, res) => {
    let data = await Listing.find({});
    res.render("home_page.ejs", {data});
}))

router.get("/new", isLoggedIn , (req, res) => {
    res.render("new_page.ejs");
})

router.get("/:id", asyncWrap(async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id).populate("reviews");
    if(!data) {
        req.flash("error", "Listing does not exist");
        res.redirect("/Listings");
    }
    res.render("read_page.ejs", {data} );
}))
router.post("/", validateListing, asyncWrap(async (req, res) => {
    console.log(req.body);
    let n_data = req.body; 
    const new_data = new Listing(n_data);
    await new_data.save();
    req.flash("success", "Listing Created Successfully");
    res.redirect("/Listings");
}))

router.get("/:id/edit", isLoggedIn, asyncWrap (async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id);
    if(!data) {
        req.flash("error", "Listing does not exist");
        res.redirect("/Listings");
    }
    res.render("edit_page.ejs", { data });
}));

router.put("/:id", isLoggedIn, validateListing, asyncWrap(async (req, res) => {
    let id = req.params.id;
    let updatedData = req.body;
    await Listing.findByIdAndUpdate(id, updatedData, { new: true });
    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/Listings/${id}`);
}));

router.delete("/:id", isLoggedIn , asyncWrap(async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/Listings");
}));

module.exports = router;
