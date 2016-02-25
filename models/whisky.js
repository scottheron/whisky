'use strict';
module.exports = function(sequelize, DataTypes) {
  var whisky = sequelize.define('whisky', {
    name: DataTypes.STRING,
    tasting: DataTypes.TEXT,
    age: DataTypes.STRING,
    distillerydescription: DataTypes.TEXT,
    distilleryaddress: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.whisky.belongsToMany(models.user, {through: 'usersWhiskys'});
        models.whisky.belongsToMany(models.tag, {through: 'whiskiesTags'});
      }
    }
  });
  return whisky;
};