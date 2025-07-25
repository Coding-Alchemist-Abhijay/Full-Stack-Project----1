const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listings.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const asyncWrap = require('./utils/AsyncWrap.js')
const ExpressError = require('./utils/CustomError.js');
const Reviews = require('./models/review.js');
const {listingSchema} = require('./schema.js');
const {reviewSchema} = require('./schema.js');
const Review = require('./models/review.js');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
}

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
}


const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

main()
.then(() => {
    console.log("connection successful");
})
.catch((err) => 
    console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}
  
app.get("/Listings", asyncWrap(async(req, res) => {
    let data = await Listing.find({});
    res.render("home_page.ejs", {data});
}))

app.get("/Listings/new", (req, res) => {
    res.render("new_page.ejs");
})

app.get("/Listings/:id", asyncWrap(async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id).populate("reviews");
    res.render("read_page.ejs", {data} );
}))
app.post("/Listings", validateListing, asyncWrap(async (req, res) => {
    console.log(req.body);
    let n_data = req.body; 
    const new_data = new Listing(n_data);
    await new_data.save();
    res.redirect("/Listings");
}))

app.get("/Listings/:id/edit", asyncWrap (async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id);
    res.render("edit_page.ejs", { data });
}));

app.put("/Listings/:id", validateListing, asyncWrap(async (req, res) => {
    let id = req.params.id;
    let updatedData = req.body;
    await Listing.findByIdAndUpdate(id, updatedData, { new: true });
    res.redirect(`/Listings/${id}`);
}));

app.delete("/Listings/:id", asyncWrap(async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/Listings");
}));

app.post("/Listings/:id/reviews", validateReview, asyncWrap(async(req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    const new_Review = new Reviews(req.body);
    listing.reviews.push(new_Review);
    await new_Review.save();
    await listing.save();
    res.redirect(`/listings/${listing.id}`);
}))

app.delete("/Listings/:id/reviews/:reviewId", asyncWrap(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    res.redirect(`/listings/${id}`);
}))

app.get("/", (req, res) => {
    res.send("Welcome to the Listings App!");
});

// when request to route that does not exist is called then this executed
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("Server is running");
})
