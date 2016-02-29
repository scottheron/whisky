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
    var tagsCtrl = require('./controllers/tags');
    var whiskyCtrl = require('./controllers/whisky');

    /*Flickr api key setup*/
    var Flickr = require("node-flickr");
    var keys = {"api_key": process.env.FLICKR_KEY};//API key link for Flickr
    var flickr = new Flickr(keys);

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
    // app.use("/tags", tagsCtrl);
    // app.use("/whisky", whiskyCtrl);
        
    /*Sets up the home route and renders its index.ejs located in the views folder*/
    app.get("/", function(req, res){
        res.render("index.ejs");
    });

    /*Sets up path for about page*/
    app.get("/about", function(req, res){
        res.render("about.ejs");
    })

    

    
    /*Route for whisky where Data scraping occurs and the text retrieved is sent to the whisky.ejs
    file to be actioned.*/
    app.get("/whisky", function(req, res){
        flickr.get("photos.search",{
            text: "single+malt+whisky"
        }, function(err, result) {
        if(err) { res.send({'msg': 'error', 'error': e}); }
            res.render("whisky.ejs", {result});
        });
                
    });

    /*set up the route whisky/:id to grab the name of the whisky and send it to the whisky route for the scrap
    address. Then perform a flickr image search and if the search is invalid (contains a '-' or returns less than 
    10 results) search with default settings "single+malt+whisky". In addition if the listItems and bottling 
    variables are undefined set them to a blank array*/
    app.get("/whisky/:id", function(req, res){
        var whiskyName = req.params.id;
        var search;
        jsdom.env(
                "http://www.scotchmaltwhisky.co.uk/"+whiskyName+".htm",
                ["http://code.jquery.com/jquery.js"],
                function (err, window) {
                    var bottlings = window.$(".bodytext")['5'];
                    var tastings = window.$(".bodytext")['3'];
                    if (!bottlings){
                        var listItems = [];
                    } else {
                        var listItems = bottlings.getElementsByTagName('li');
                    }
                    if (!tastings){
                        tastings = [];
                    }
                    search = whiskyName+"+whisky";
                    if(search.indexOf("-") != -1) {
                        search = "single+malt+whisky";
                    }
                    flickr.get("photos.search", {
                        text: search
                    },
                    function(err, result){
                        if (result.photos.photo.length < 10){
                            search = "single+malt+whisky";
                        } else {
                            search = whiskyName;
                        }
                    });
                    flickr.get("photos.search",{
                        text: search
                    }, function(err, result) {
                        if(err) { res.send({'msg': 'error', 'error': e}); }
                        res.render("whiskyId.ejs", {
                            bottlings: listItems,
                            tastings: tastings.textContent,
                            whiskyName: whiskyName,
                            result: result
                        });
                    });
                      
                }
            );
        }
    );
    
    /*Post route to send the whisky name to the database and save it to the users profile as a favorite
    using the join table*/
    app.post("/whisky/:id", function(req, res){
        var whiskyName = req.params.id;
        var tastings = req.body.tastings;
        if (req.currentUser){
            var userId = req.session.userId;
            db.whisky.findOrCreate({
                where: {
                    name: whiskyName,
                },
                defaults: {
                    tasting: tastings
                }
            })
            .spread(function(whisky){
                db.user.find({
                    where: {
                        id: userId
                    }
                })
                .then(function(user){
                    if (user) {
                        user.addWhisky(whisky);
                        res.redirect('/whisky/'+whiskyName);
                    } else {
                        res.send("error");
                    }
                    
                });
            });
        } else {
            res.redirect("/signuporlogin/login");
        }
    });

    /*Sets up a 404 route to catch invalid paths and display the 404 page.*/
    app.use(function(req, res, next) {
        res.status(404).render("404");
    });

    /*Sets up the port for the web server to default to 3000 if it isn't specified*/
    var port = process.env.PORT || 3000;
    app.listen(port, function() {
    });
}());