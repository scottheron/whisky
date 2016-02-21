'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('collections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      globalscore: {
        type: Sequelize.INTEGER
      },
      userrating: {
        type: Sequelize.INTEGER
      },
      tasting: {
        type: Sequelize.TEXT
      },
      age: {
        type: Sequelize.INTEGER
      },
      abv: {
        type: Sequelize.INTEGER
      },
      distillery_id: {
        type: Sequelize.INTEGER
      },
      brand_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('collections');
  }
};