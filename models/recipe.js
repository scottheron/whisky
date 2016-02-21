'use strict';
module.exports = function(sequelize, DataTypes) {
  var recipe = sequelize.define('recipe', {
    name: DataTypes.STRING,
    ingredients: DataTypes.TEXT,
    method: DataTypes.TEXT,
    brand_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return recipe;
};