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
	var Flickr = require("node-flickr");
	var keys = {"api_key": process.env.FLICKR_KEY};//API key link for Flickr
	var	flickr = new Flickr(keys);

	var upload = multer({dest: './uploads'});
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
      			res.redirect('/signup');
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
  		var password2 = req.body.password2;
	  	if(password === password2) {
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
				res.redirect("/login");
			})
			.catch(function(err){
				res.send(err);
			});
	  	} else {
	  		res.redirect("/signup");
	  	}	
	  		
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
			var userId = req.session.userId
			db.user.find({
				where: {
					id: userId
				}
			})
			.then(function(user){
				var userPic = cloudinary.url(user.image, { width: 300});
				user.getWhiskies({include:[db.tag]})
				.then(function(whisky) {
					//console.
					res.render("profile", {user, whisky, userPic});
				});
			});
		} else {
			res.redirect("/login");
		}
	});

	/*Post route for /profile. used to grab the tag and push it back out as text*/
	app.post("/profile", function(req, res){
		var tag = req.body.tag;
		var whiskyName = req.body.whiskyName;
		db.tag.findOrCreate({
			where: {
				tag: tag
			}
		})
		.spread(function(tag){
			db.whisky.find({
				where: {
					name: whiskyName
				}
			})
			.then(function(whisky){
				if (whisky)	{
					whisky.addTag(tag);
					res.redirect("/profile");
				} else {
					
					res.send("error");
				}
			});
		});
	});

	/*Sets route for a settings page for a users profile where they can upload a picture*/
	app.get("/profile/settings", function(req, res){
		if (req.currentUser) {
			db.user.find({
				where: {
					id: req.session.userId
				}
			})
			.then(function(user){
				var userPic = cloudinary.url(user.image, { width: 300});
	        	res.render('profilesettings.ejs', {
	            	userPic: userPic
	        	});
			});
		} else {
			res.redirect("/login");
		}
	});
	
	/*Post route for settings uploads a users profile picture choice and saves the resultant URL link to
	the database entry for the user table under image*/
	app.post("/profile/settings", upload.single('avatar'), function(req, res){
		cloudinary.uploader.upload(req.file.path, function(result) {
    		avatarId = result.public_id;
    		db.user.update({
    			image: avatarId
    		},{
    			where: {
    				id: req.session.userId
    			}
    		})
    		.then(function(avatarId){
				if (avatarId)	{
					res.redirect("/profile/settings");
				} else {
					res.send("error");
				}
			});
  		});
	});

	/*Set route to delete a favorite from the database*/
	app.get('/profile/:id/delete', function(req, res) {
   		 var id = req.params.id;
  		 var userId = req.session.userId;
  		 db.usersWhiskys.destroy({
    		where: {
       			whiskyId: id,
       			userId: userId
     		}
  		 })
  		 .then(function() {
     		res.redirect('/profile');
  		 })
  		 .catch(function(e) {
     		res.send({'msg': 'error', 'error': e});
  		 });
	});

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
			res.redirect("/login");
		}
	});

	/*Sets up the port for the web server to default to 3000 if it isn't specified*/
	var port = process.env.PORT || 3000;
	app.listen(port, function() {
	});
}());