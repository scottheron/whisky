'use strict';

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      validate: {
        len: [8,99]
      }
    },
    image: DataTypes.STRING,
    favorites: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      authenticate: function(email, password, callback){
        this.find({
          where: {
            email: email
          }
        }).then(function(user){
          if (!user) return callback(null, false);
          bcrypt.compare(password, user.password, function(err, result){
            if(err) return callback(err);
            //return error as null, then return result if user is false
            callback(null, result ? user : false);
          });
        });
      }
    },
    hooks: {
      beforeCreate: function(user, options, callback) {
        if (user.password) {
          bcrypt.hash(user.password, 10, function(err, hash){
            if(err) return callback(err);
            user.password = hash;
            callback(null, user);
          });
        } else {
          callback(null, user);
        }
      }
    }
  });
  return user;
};