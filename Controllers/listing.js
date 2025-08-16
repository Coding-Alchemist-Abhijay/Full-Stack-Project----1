const Listing = require('../models/listings.js');
const ExpressError = require('../utils/CustomError.js');

// Get all listings
module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    res.render("home_page.ejs", { data: listings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("new_page.ejs");
};

// Show a single listing
module.exports.show = async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!data) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/Listings");
    }
    res.render("read_page.ejs", { data });
};

// Create a new listing
module.exports.create = async (req, res) => {
    let n_data = req.body;
    
    // Handle uploaded file
    if (req.file) {
        n_data.image = {
            filename: req.file.filename,
            url: req.file.path
        };
    }
    
    const new_data = new Listing(n_data);
    new_data.owner = req.user._id;
    await new_data.save();
    req.flash("success", "Listing Created Successfully");
    res.redirect("/Listings");
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id);
    if (!data) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/Listings");
    }
    res.render("edit_page.ejs", { data });
};

// Update a listing
module.exports.update = async (req, res) => {
    let id = req.params.id;
    let updatedData = req.body;
    await Listing.findByIdAndUpdate(id, updatedData, { new: true });
    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/Listings/${id}`);
};

// Delete a listing
module.exports.delete = async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/Listings");
};

