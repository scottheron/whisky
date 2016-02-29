/* Controller for tags */

/*require the various middleware packages such as express and bodyParser*/
var express = require("express");
var bodyParser = require("body-parser");
var db = require("../models");
var router = express.Router();
var jsdom = require("jsdom");

router.use(bodyParser.urlencoded({extended: false}));

/*Flickr api key setup*/
var Flickr = require("node-flickr");
var keys = {"api_key": process.env.FLICKR_KEY};//API key link for Flickr
var flickr = new Flickr(keys);

/*Route for whisky where Data scraping occurs and the text retrieved is sent to the whisky.ejs
file to be actioned.*/
router.get("/", function(req, res){
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
router.get("/:id", function(req, res){
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
router.post("/:id", function(req, res){
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

module.exports = router;