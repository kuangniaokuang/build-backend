'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contributors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        field: 'email',
        type: Sequelize.STRING,
      },
      provider: {
        field: 'provider',
        type: Sequelize.ENUM('github', 'gitlab'),
      },
      remoteId: {
        field: 'remote_id',
        type: Sequelize.INTEGER,
      },
      displayName: {
        field: 'display_name',
        type: Sequelize.STRING
      },
      username: {
        field: 'username',
        type: Sequelize.STRING
      },
      profileUrl: {
        field: 'profile_url',
        type: Sequelize.STRING
      },
      photoUrl: {
        field: 'photo_url',
        type: Sequelize.STRING
      },
      userId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        allowNull: true
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
      }
    })
    await queryInterface.addConstraint('contributors' , {
      fields: ['email', 'remote_id', 'provider'],
      type: 'unique',
      name: 'contributors_remote_id_provider'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contributors')
  }
}