'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Users',
      'email',
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Users',
      'email',
      {
        type: Sequelize.STRING,
        isEmail: true,
        allowNull: true,
        unique: true,
        notEmpty: true
      }
    );
  }
};
