/* Controller for signup and login routes, in addition log out */

/*require the various middleware packages such as express and bodyParser*/
var express = require("express");
var bodyParser = require("body-parser");
var db = require("../models");
var router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));

/*Sets up the login route and renders the login page*/
router.get("/login", function(req, res){
    res.render("login.ejs");
});

/*Takes the login info from the form on the login page and matches it against the database
to make sure there is a match. Then redirect to the home page*/
router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if(!req.currentUser) {    
        db.user.authenticate(email, password, function(err, user) {
            if (err) {
                res.send(err);
            } else if (user) {
                req.session.userId = user.id;
                res.redirect('/whisky');
            } else {
                res.redirect('/signuporlogin/signup');
            }
        });
    } else {
        res.redirect("/");
    }
});

/*Set up the sign up route and render the signup page*/
router.get("/signuporlogin/signup", function(req, res){
    res.render("signup.ejs");
});

/*Grab the sign up information from the form on the sign up page. If the user doesn't
already exist then create a database entry for the new user with their name, email 
and password.*/
router.post("/signuporlogin/signup", function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    if(password.length < 10 && password === password2) {
        db.user.findOrCreate({
            where: {
                email: email
            },
            defaults: {
                name: name,
                password: password
            }
        })
        .spread(function(user, created){
            res.redirect("/signuporlogin/login");
        })
        .catch(function(err){
            res.send(err);
        });
    } else {
        res.redirect("/signuporlogin/signup");
    }   
        
});

/*Sets the route for logging out and redirects to the welcome page after signing the user out of
their session*/
router.get('/logout', function(req, res) {
    req.session.userId = false;
    res.redirect('/');
});

/*Sets up a 404 route to catch invalid paths and display the 404 page.*/
router.use(function(req, res, next) {
    res.status(404).render("404");
});

module.exports = router;