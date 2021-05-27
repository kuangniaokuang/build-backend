'use strict';

const migration = require('../scripts/migtareProjectUrls')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await migration.migrateProjectUrls()
    } catch (error) {
      console.log('ERROR: error', error)
    }
  },

  down: async (queryInterface, Sequelize) => {
    
  }
};
