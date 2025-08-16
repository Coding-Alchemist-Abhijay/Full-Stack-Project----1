if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const listingRoutes = require('./routes/listing.js');
const reviewRoute = require("./routes/reviews.js");
const userRoute = require("./routes/User.js");
const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const ExpressError = require('./utils/CustomError.js');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

let sessionOptions = {
    secret: "thisisasecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // to prevent cross-scripting attacks
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7), // in milliseconds and date.now also returns in milliseconds.
        maxAge: 1000 * 60 * 60 * 24 * 7,
    } // info stored of user for 7 days.
}

app.use(expressSession(sessionOptions));
app.use(flash()); // make sure to use app.use session and flash above the routes.

app.use(passport.initialize());
app.use(passport.session()); // allows website to track that whether a same or different user has reaccessed the website in that session.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // to store user info in session.
passport.deserializeUser(User.deserializeUser()); // to unstore info once session has ended.

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user; // stores information about user (details regarding him when he is logged in in session) but is undefined when user is not logged in.
    next();
});

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
  
app.use("/Listings", listingRoutes);
app.use("/Listings/:id/reviews", reviewRoute);
app.use("/", userRoute);
app.get("/", (req, res) => {
    res.send("Welcome to the Listings App!");
});

// when request to route that does not exist is called then this executed
app.get((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("Server is running");
})
