const express = require('express');
const router = express.Router();
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require('../Controllers/user.js');

// Signup routes
router.route('/signup')
    .get(userController.renderSignup)
    .post(userController.signup);

// Login routes
router.route('/login')
    .get(userController.renderLogin)
    .post(
        saveRedirectUrl, 
        passport.authenticate("local", { failureRedirect: "/login", failureFlash: true}),
        userController.login
    );

// Logout route
router.route('/logout')
    .get(userController.logout);

module.exports = router;