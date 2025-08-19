const Listing = require('../models/listings.js');
const ExpressError = require('../utils/CustomError.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const access_Token = process.env.MAP_API_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: access_Token});

// Get all listings
module.exports.index = async (req, res) => {
    const listings = await Listing.find({});
    // For each listing, get its coordinates and store them in the geometry field
    for (let listing of listings) {
        if (!listing.geometry || !listing.geometry.coordinates || listing.geometry.coordinates.length === 0) {
            try {
                let response = await geocodingClient.forwardGeocode({
                    query: listing.location,
                    limit: 1
                }).send();
                if (response.body.features && response.body.features.length > 0) {
                    listing.geometry = response.body.features[0].geometry;
                    await listing.save();
                }
            } catch (err) {
                // Optionally log error, but don't break the loop
                console.error(`Geocoding failed for listing ${listing._id}:`, err.message);
            }
        }
    }
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
            url: req.file.path // This should be the Cloudinary URL
        };
    } else {
        // Set default image if no file uploaded
        n_data.image = {
            filename: "default-image",
            url: "https://images.unsplash.com/photo-1747767763480-a5b4c7a82aef?q=80&w=1204&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        };
    }
    
    const new_data = new Listing(n_data);
    let response = await geocodingClient.forwardGeocode({
        query: new_data.location,
        limit: 1
      })
        .send()
    new_data.owner = req.user._id;
    new_data.geometry = response.body.features[0].geometry;
    await new_data.save();
    req.flash("success", "Listing Created Successfully");
    console.log("hello");
    
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
        let url = data.image.url;
        url = url.replace('/upload', '/upload/,h_200,w_250,c_fill/r_max/e_outline,co_brown');
    res.render("edit_page.ejs", { data , url });
};

// Update a listing
module.exports.update = async (req, res) => {
    let id = req.params.id;
    let updatedData = req.body;
    
    // Handle uploaded file
    if (req.file) {
        updatedData.image = {
            filename: req.file.filename,
            url: req.file.path // This should be the Cloudinary URL
        };
    }
    
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

