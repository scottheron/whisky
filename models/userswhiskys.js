'use strict';
module.exports = function(sequelize, DataTypes) {
  var usersWhiskys = sequelize.define('usersWhiskys', {
    user_id: DataTypes.INTEGER,
    collection_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return usersWhiskys;
};