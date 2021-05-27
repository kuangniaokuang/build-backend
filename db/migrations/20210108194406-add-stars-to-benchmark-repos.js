'use strict';

const config = require('../../config/env/resolveConfig')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!config.custom.supportsBenchmarkRepos) {
      return
    }
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('benchmark_repos', 'stars', {
        type: Sequelize.DataTypes.INTEGER
      }, { transaction }),
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    if (!config.custom.supportsBenchmarkRepos) {
      return
    }
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('benchmark_repos', 'stars', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
