/*WDI06SEA Project 2 - Whisky Match

Concept - match a user with a single malt Scottish whisky based on their user preferences. Display where the distillery 
is located on a map and suggest recipies that incorporate the whisky. The users can save their favorite whiskys to their
user profile.

This is Main index.js file for the app*/

/*self closing function to contain the code so as to isolate variables and 
global variables. Closes at the end of the code.*/
(function(){

	/*require the various middleware packages such as express and request*/
	var express = require("express");
	var ejsLayouts = require("express-ejs-layouts");
	var request = require("request");
	var bodyParser = require("body-parser");

	var app = express();//sets express to variable app

	/*Sets up the view engine to ejs, uses ejsLayouts to enable the layout.ejs file and sets up the static directory
	for files such as CSS and JS.*/
	app.set("view engine", "ejs");
	app.use(ejsLayouts);
	app.use(express.static(__dirname + '/static'));//sets up static pages

	/*Sets up the home route and renders its index.ejs located in the views folder*/
	app.get("/", function(req, res){
		res.render("index.ejs");
	});

	app.get("/login", function(req, res){
		res.render("login.ejs");
	});

	app.get("/signup", function(req, res){
		res.render("signup.ejs");
	});

	app.get("/profile", function(req, res){
		res.render("profile.ejs");
	});

	app.get("/whisky", function(req, res){
		res.render("whisky.ejs");
	});

	app.get("/tags/:id", function(req, res){
		res.render("tags.ejs");
	});

	/*Sets up the port for the web server to default to 3000 if it isn't specified*/
	var port = process.env.PORT || 3000;
	app.listen(port, function() {
	});

}());