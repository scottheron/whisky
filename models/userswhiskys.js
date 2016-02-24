'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersWhiskys = sequelize.define('usersWhiskys', {
    userId: DataTypes.INTEGER,
    whiskyId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersWhiskys;
};