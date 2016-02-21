'use strict';
module.exports = function(sequelize, DataTypes) {
  var collection = sequelize.define('collection', {
    globalscore: DataTypes.INTEGER,
    userrating: DataTypes.INTEGER,
    tasting: DataTypes.TEXT,
    age: DataTypes.INTEGER,
    abv: DataTypes.INTEGER,
    distillery_id: DataTypes.INTEGER,
    brand_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return collection;
};