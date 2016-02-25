'use strict';
module.exports = function(sequelize, DataTypes) {
  var whiskiesTags = sequelize.define('whiskiesTags', {
    tagId: DataTypes.INTEGER,
    whiskyId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return whiskiesTags;
};