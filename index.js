/*WDI06SEA Project 2 - Whisky Match by Scott Heron

Concept - match a user with a single malt Scottish whisky based on their user preferences. Display where the distillery 
is located on a map and suggest recipies that incorporate the whisky. The users can save their favorite whiskys to their
user profile.

This is Main index.js file for the app*/

/*self closing function to contain the code so as to isolate variables and 
global variables. Closes at the end of the code.*/
(function(){

    /*require the various middleware packages such as express and bodyParser*/
    var express = require("express");
    var app = express();//sets express to variable app
    var ejsLayouts = require("express-ejs-layouts");
    var request = require("request");
    var bodyParser = require("body-parser");
    var session = require("express-session");
    var jsdom = require("jsdom");
    var multer = require("multer");
    var cloudinary = require("cloudinary");
    var db = require("./models");
    
    /*Controller paths*/
    var profileCtrl = require('./controllers/profile');
    var signuporloginCtrl = require('./controllers/signuporlogin');
    var whiskyCtrl = require('./controllers/whisky');

    /*multer file uploader setup*/
    var upload = multer({dest: './uploads'});
    /*sets an avatar variable used to contain the users uploaded image*/
    var avatar = "";
    
    /*Sets up the middleware for view engine, ejsLayouts, bodyParser, session and sets up 
    the static directory for files such as CSS and JS.*/
    app.set("view engine", "ejs");
    app.use(ejsLayouts);
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(express.static(__dirname + '/static'));//sets up static pages
    app.use(session({
        secret: 'Super secreT SaUcE',
        resave: false,
        saveUninitialized: true
    }));
    app.use(function(req, res, next){
        if (req.session.userId) {
            db.user.findById(req.session.userId).then(function(user){
                req.currentUser = user;
                res.locals.currentUser = user;
                next();
            });
        } else {
            req.currentUser = false;
            res.locals.currentUser = false;
            next();
        }
    });

    /*app.get for controllers to set their router paths*/
    app.use("/profile", profileCtrl);
    app.use("/signuporlogin", signuporloginCtrl);
    app.use("/whisky", whiskyCtrl);
        
    /*Sets up the home route and renders its index.ejs located in the views folder*/
    app.get("/", function(req, res){
        res.render("index.ejs");
    });

    /*Sets up path for about page*/
    app.get("/about", function(req, res){
        res.render("about.ejs");
    })

    /*Sets up a 404 route to catch invalid paths and display the 404 page.*/
    app.use(function(req, res, next) {
        res.status(404).render("404");
    });

    /*Sets up the port for the web server to default to 3000 if it isn't specified*/
    var port = process.env.PORT || 3000;
    app.listen(port, function() {
    });
}());