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
	var app = express();//sets express to variable app
	var ejsLayouts = require("express-ejs-layouts");
	var request = require("request");
	var bodyParser = require("body-parser");
	var session = require("express-session");
	var jsdom = require("jsdom");
	var db = require("./models");

	

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
	
	/*Sets up the home route and renders its index.ejs located in the views folder*/
	app.get("/", function(req, res){
		res.render("index.ejs");
	});

	/*Sets up the login route and renders the login page*/
	app.get("/login", function(req, res){
		res.render("login.ejs");
	});

	/*Takes the login info from the form on the login page and matches it against the database
	to make sure there is a match. Then redirect to the home page*/
	app.post('/login', function(req, res) {
  		var email = req.body.email;
  		var password = req.body.password;
  		db.user.authenticate(email, password, function(err, user) {
    		if (err) {
     			res.send(err);
    		} else if (user) {
      			req.session.userId = user.id;
      			res.redirect('/whisky');
    		} else {
      			res.redirect('/login');
    		}
  		});
	});

	/*Set up the sign up route and render the signup page*/
	app.get("/signup", function(req, res){
		res.render("signup.ejs");
	});

	/*Grab the sign up information from the form on the sign up page. If the user doesn't
	already exist then create a database entry for the new user with their name, email 
	and password*/
	app.post("/signup", function(req, res){
		var name = req.body.name;
		var email = req.body.email;
  		var password = req.body.password;
  		db.user.findOrCreate({
			where: {
				email: email
			},
			defaults: {
				name: name,
				password: password
			}
		}).spread(function(user, created){
			res.redirect("/login");
		}).catch(function(err){
			res.send(err);
		});
	});

	/*Sets the route for logging out and redirects to the welcome page after signing the user out of
	their session*/
	app.get('/logout', function(req, res) {
  		req.session.userId = false;
  		res.redirect('/');
	});

	/*Sets the route for the users profile, checks to make sure the user is logged in, if they are
	the page is diplayed.*/
	app.get("/profile", function(req, res){
		if (req.currentUser) {
			res.render("profile.ejs");
		} else {
			res.redirect("/login");
		}
	});

	/*Route for whisky where Data scraping occurs and the text retrieved is sent to the whisky.ejs
	file to be actioned.*/
	app.get("/whisky", function(req, res){
		res.render("whisky.ejs");		
	});

	/*set up the route whisky/:id to grab the name of the whisky and send it to the whisky route for the scrap
	address*/
	app.get("/whisky/:id", function(req, res){
		var whiskyName = req.params.id;
		//console.log(whiskyName);
		jsdom.env(
  				"http://www.scotchmaltwhisky.co.uk/"+whiskyName+".htm",
  				["http://code.jquery.com/jquery.js"],
  				function (err, window) {
  					var bottlings = window.$(".bodytext")['5'];
  					var tastings = window.$(".bodytext")['3'];
  					var listItems = bottlings.getElementsByTagName('li');
  					//for (var key in listItems){console.log(listItems[key].textContent);}
					res.render("whiskyId.ejs", {
						bottlings: listItems,
						tastings: tastings.textContent,
						whiskyName: whiskyName
					});
  				}
			);
		}
	);
	
	/*Post route to send the whisky information to the database and save it to the users profile*/
	app.post("/whisky/:id", function(req, res){
	 	var whiskyName = req.params.id;
	if (req.currentUser){
		var userId = req.session.userId;
		db.whisky.findOrCreate({
			where: {
				name: whiskyName,
				
			}
		})
		.spread(function(whisky){
			console.log("here");
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
		res.redirect("/login");
	}
	 	
		
	});

	app.get("/tags/:id", function(req, res){
		res.render("tags.ejs");
	});

	/*Sets up the port for the web server to default to 3000 if it isn't specified*/
	var port = process.env.PORT || 3000;
	app.listen(port, function() {
	});

}());