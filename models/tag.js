'use strict';
module.exports = function(sequelize, DataTypes) {
  var tag = sequelize.define('tag', {
    tag: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.tag.belongsToMany(models.whisky, {through: 'whiskiesTags'});
      }
    }
  });
  return tag;
};