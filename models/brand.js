'use strict';
module.exports = function(sequelize, DataTypes) {
  var brand = sequelize.define('brand', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return brand;
};