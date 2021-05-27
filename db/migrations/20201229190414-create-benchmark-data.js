const config = require('../../config/env/resolveConfig')

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!config.custom.supportsBenchmarkRepos) {
      return
    }

    await queryInterface.createTable('benchmark_repos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      repo_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id',
        },
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Projects'
          },
          key: 'id',
        },
      },
      report_id: {
        type: Sequelize.STRING,
      },
      ee_project_id: {
        type: Sequelize.STRING,
      },
      skipped: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: Sequelize.STRING,
      },
      analysis_id: {
        type: Sequelize.STRING,
      },
      analysis_status: {
        type: Sequelize.STRING,
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
  down: async (queryInterface, Sequelize) => {
    if (!config.custom.supportsBenchmarkRepos) {
      return
    }

    await queryInterface.dropTable('benchmark_repos');
  }
};
