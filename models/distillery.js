'use strict';
module.exports = function(sequelize, DataTypes) {
  var distillery = sequelize.define('distillery', {
    name: DataTypes.STRING,
    address: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return distillery;
};