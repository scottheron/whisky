'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersRecipies = sequelize.define('usersRecipies', {
    user_id: DataTypes.INTEGER,
    recipe_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersRecipies;
};