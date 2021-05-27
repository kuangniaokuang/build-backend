'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id',
        },
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gitUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      eeLastSyncTime: {
        type: Sequelize.STRING
      },
      eeProjectId: {
        type: Sequelize.STRING
      },
      eeStatus: {
        type: Sequelize.STRING
      },
      latestCommitHash: {
        type: Sequelize.STRING
      },
      latestCommitTitle: {
        type: Sequelize.STRING
      },
      latestCommitMessage: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Projects');
  }
};
