const mongoose = require('mongoose');
const Listing = require('../models/listings.js');
const newData = require('./data.js');

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

const initDB = async () => {
    await Listing.insertMany(newData.data);
}

initDB();