'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Users', 'gitlabAccessToken', {
        type: Sequelize.DataTypes.STRING
      }, { transaction }),
      await queryInterface.addColumn('Users', 'gitlabRefreshToken', {
        type: Sequelize.DataTypes.STRING
      }, { transaction }),
      await queryInterface.addColumn('Users', 'githubRefreshToken', {
        type: Sequelize.DataTypes.STRING
      }, { transaction }),
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Users', 'gitlabAccessToken', { transaction });
      await queryInterface.removeColumn('Users', 'gitlabRefreshToken', { transaction });
      await queryInterface.removeColumn('Users', 'githubRefreshToken', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
