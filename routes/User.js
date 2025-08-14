const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');


router.get('/signup', (req, res) => {
    if(req.user) {
        req.flash("success", "You have already registered !");
        return res.redirect('/Listings');
    }
    res.render('signup.ejs');
});

router.post('/signup', saveRedirectUrl, async (req, res) => {
    try {
        if(!req.body) return res.status(400).render('signup.ejs', { error: 'All fields are required.' });
        const { Username, Email, Password } = req.body;
        // Basic validation (could be expanded)
        if (!Username || !Email || !Password) {
            return res.status(400).render('signup.ejs', { error: 'All fields are required.' });
        }
        // Create new user
        const newUser = new User({ username: Username, email: Email });
        await User.register(newUser, Password); 
        // Redirect or render success
        req.login(newUser, ((err) => { // automatically logges user after singup
            if(err) {
                return next(err);
            }
            req.flash("success", "Signup successful! Welcome To WanderLust");
            res.redirect(res.locals.redirectUrl);
        }));
    } catch (err) {
        req.flash("error", "User Already Exists ! Please try again..");
        res.redirect("/signup");
    }
});

router.get('/login',(req, res) => {
    if(req.user) {
        req.flash("success", "You are already logged in !");
        return res.redirect('/Listings');
    }
    res.render('login.ejs');
});

router.post('/login', 
    saveRedirectUrl, 
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true}) ,
    async (req, res, next) => {
    const {username, password } = req.body;
    if (!username || !password) {
        return res.status(400).render('login.ejs', { error: 'All fields are required.' });
    }
    req.flash("success", "Welcome back To WanderLust !");
    res.locals.redirectUrl = res.locals.redirectUrl || "/Listings";
    return res.redirect(res.locals.redirectUrl);
});
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash("success", "You have been logged out successfully.");
        res.redirect('/Listings');
    });
});

module.exports = router;