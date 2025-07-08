const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listings.js');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

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
  
app.get("/", (req, res) => {
    console.log("hey there");
    res.send("Hello, world!");
})

app.listen(8080, () => {
    console.log("Server is running");
})
