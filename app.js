const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listings.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));


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
  
app.get("/Listings", async (req, res) => {
    let data = await Listing.find({});
    res.render("home_page.ejs", {data});
})

app.get("/Listings/new", (req, res) => {
    res.render("new_page.ejs");
})

app.get("/Listings/:id", async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id);
    res.render("read_page.ejs", {data} );
})

app.post("/Listings", async (req, res) => {
    let n_data = req.body; 
    const new_data = new Listing(n_data);
    await new_data.save();
    res.redirect("/Listings");
})

app.get("/Listings/:id/edit", async (req, res) => {
    let id = req.params.id;
    let data = await Listing.findById(id);
    res.render("edit_page.ejs", { data });
});
app.put("/Listings/:id", async (req, res) => {
    let id = req.params.id;
    let updatedData = req.body;
    await Listing.findByIdAndUpdate(id, updatedData, { new: true });
    res.redirect(`/Listings/${id}`);
});

app.delete("/Listings/:id", async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/Listings");
});

app.get("/", (req, res) => {
    res.send("Welcome to the Listings App!");
});

app.listen(8080, () => {
    console.log("Server is running");
})
