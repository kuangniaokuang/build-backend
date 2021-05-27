'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BaselineRepoMeta', {
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
      },
      email: Sequelize.STRING,
      gitUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userCommits: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      totalCommits: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      totalCommitters: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      forked: {
        type: Sequelize.BOOLEAN
      },
      repoSize: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BaselineRepoMeta');
  }
};
