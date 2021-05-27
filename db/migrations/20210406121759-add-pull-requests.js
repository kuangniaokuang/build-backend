'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pull_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'Projects'
          },
          key: 'eeProjectId'
        },
        allowNull: false
      },
      remoteId: {
        field: 'remote_id',
        allowNull: false,
        type: Sequelize.INTEGER
      },
      apiUrl: {
        field: 'api_url',
        allowNull: false,
        type: Sequelize.STRING
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      author: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'contributors'
          },
          key: 'id'
        }
      },
      user: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id'
        }
      },
      provider: {
        type: Sequelize.ENUM('github', 'gitlab')
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE
      },
      closedAt: {
        field: 'closed_at',
        type: Sequelize.DATE
      },
      mergedAt: {
        field: 'merged_at',
        type: Sequelize.DATE
      },
      mergeCommit: {
        field: 'merge_commit',
        allowNull: false,
        type: Sequelize.STRING
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    // await queryInterface.sequelize.query(`DROP CONSTRAINT unique_remote_id;`)
    await queryInterface.dropTable('pull_requests')
  }
}
