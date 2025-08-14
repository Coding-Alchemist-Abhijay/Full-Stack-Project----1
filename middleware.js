module.exports = loggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // saves the last url before logging in.
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session && req.session.redirectUrl) { // if it exists
        res.locals.redirectUrl = req.session.redirectUrl; // since passport automatically resets req.originalUrl; after loggin in or signing up etc. so value becomes undefined so storing it in locals. 
    }
    next();
};

module.exports.saveRedirectUrl = saveRedirectUrl;
