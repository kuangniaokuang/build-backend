'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'Users',
        'email',
        {
          type: DataTypes.STRING,
          isEmail: true,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.removeColumn('Users', 'firstName', { transaction });
      await queryInterface.removeColumn('Users', 'lastName', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'Users',
        'email',
        {
          type: DataTypes.STRING,
          isEmail: false,
          allowNull: true
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
