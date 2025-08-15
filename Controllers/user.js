const User = require('../models/user.js');
const passport = require('passport');

// Render signup page
module.exports.renderSignup = (req, res) => {
    if(req.user) {
        req.flash("success", "You have already registered !");
        return res.redirect('/Listings');
    }
    res.render('signup.ejs');
};

// Handle signup logic
module.exports.signup = async (req, res, next) => {
    try {
        if(!req.body) return res.status(400).render('signup.ejs', { error: 'All fields are required.' });
        const { Username, Email, Password } = req.body;
        if (!Username || !Email || !Password) {
            return res.status(400).render('signup.ejs', { error: 'All fields are required.' });
        }
        const newUser = new User({ username: Username, email: Email });
        await User.register(newUser, Password); 
        req.login(newUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Signup successful! Welcome To WanderLust");
            res.redirect("/Listings");
        });
    } catch (err) {
        req.flash("error", "User Already Exists ! Please try again..");
        res.redirect("/signup");
    }
};

// Render login page
module.exports.renderLogin = (req, res) => {
    if(req.user) {
        req.flash("success", "You are already logged in !");
        return res.redirect('/Listings');
    }
    res.render('login.ejs');
};

// Handle login logic
module.exports.login = async (req, res) => {
    const {username, password } = req.body;
    if (!username || !password) {
        return res.status(400).render('login.ejs', { error: 'All fields are required.' });
    }
    req.flash("success", "Welcome back To WanderLust !");
    res.locals.redirectUrl = res.locals.redirectUrl || "/Listings";
    return res.redirect(res.locals.redirectUrl);
};

// Handle logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", "You have been logged out successfully.");
        res.redirect('/Listings');
    });
};
