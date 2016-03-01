/*Controller file for the profile related pages*/

/*require the various middleware packages such as express and bodyParser*/
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var cloudinary = require("cloudinary");
var db = require("../models");
var router = express.Router();

/*multer file uploader setup*/
var upload = multer({dest: './uploads'});
/*sets an avatar variable used to contain the users uploaded image*/
var avatar = "";

router.use(bodyParser.urlencoded({extended: false}));

/*Sets the route for the users profile, checks to make sure the user is logged in, if they are
the page is diplayed.*/
router.get("/", function(req, res){
    if (req.currentUser) {
        var userId = req.session.userId
        db.user.find({
            where: {
                id: userId
            }
        })
        .then(function(user){
            var userPic = cloudinary.url(user.image, { width: 300 });
            user.getWhiskies({include:[db.tag]})
            .then(function(whisky) {
                res.render("profile", {user, whisky, userPic});
            });
        });
    } else {
        res.redirect("/signuporlogin/login");
    }
});

/*Post route for /profile. used to grab the tag, save it to the database assuming it doesnt esist already
 and push it back out as text to the relivant whisky*/
router.post("/", function(req, res){
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
            if (whisky) {
                whisky.addTag(tag);
                res.redirect("/profile");
            } else {
                
                res.send("error");
            }
        });
    });
});

/*Sets route for a settings page for a users profile where they can upload a picture*/
router.get("/settings", function(req, res){
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
        res.redirect("/signuporlogin/login");
    }
});

/*Post route for settings uploads a users profile picture choice and saves the resultant URL link to
the database entry for the user table under image*/
router.post("/settings", upload.single('avatar'), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        avatarId = result.public_id;
        db.user.update({
            image: avatarId
        },{
            where: {
                id: req.session.userId
            }
        })
        .then(function(){
            res.redirect("/profile/settings");
          
        });
    });
});

/*Set route to delete a favorite from the database*/
router.get('/:id/delete', function(req, res) {
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

/*Sets up a 404 route to catch invalid paths and display the 404 page.*/
router.use(function(req, res, next) {
    res.status(404).render("404");
});

module.exports = router;