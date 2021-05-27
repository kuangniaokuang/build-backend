'use strict'

const migrationScript = require('../scripts/migrateAccessTokensToEncrypted')
const { User } = require('../models')

module.exports = {
  up: async function (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      try {
        await queryInterface.addColumn(
          'Users',
          'isPublic',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
          },
          { transaction }
        );  
      } catch (error) {
      }
      
      await queryInterface.changeColumn(
        'Users',
        'githubAccessToken', {
          type: `${Sequelize.JSONB} USING jsonb_build_object(coalesce("githubAccessToken", 'unknown'), coalesce("githubAccessToken", 'unknown'))`
        },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'githubRefreshToken', {
          type: `${Sequelize.JSONB} USING jsonb_build_object(coalesce("githubRefreshToken", 'unknown'), coalesce("githubRefreshToken", 'unknown'))`
        },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'gitlabAccessToken', {
          type: `${Sequelize.JSONB} USING jsonb_build_object(coalesce("gitlabAccessToken", 'unknown'), coalesce("gitlabAccessToken", 'unknown'))`
        },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'gitlabRefreshToken', {
          type: `${Sequelize.JSONB} USING jsonb_build_object(coalesce("gitlabRefreshToken", 'unknown'), coalesce("gitlabRefreshToken", 'unknown'))`
        },
        { transaction }
      )
      await migrationScript.updateUserColumnToEncryptedHash(transaction)
      await transaction.commit()
    } catch (error) {
      console.log('ERROR: error', error)
      await transaction.rollback()
    }
  },

  down: async function (queryInterface, Sequelize) {
    const users = await User.findAll()

    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn(
        'Users',
        'githubAccessToken', {
          type: Sequelize.TEXT
        },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'githubRefreshToken', {
          type: Sequelize.TEXT
        },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'gitlabAccessToken', {
          type: Sequelize.TEXT
        },
        { transaction }
      )
      await queryInterface.changeColumn(
        'Users',
        'gitlabRefreshToken', {
          type: Sequelize.TEXT
        },
        { transaction }
      )
      await migrationScript.revertEncryptedTokens(users, transaction)
      await transaction.commit()
    } catch (error) {
      console.log('ERROR: error', error)
      await transaction.rollback()
    }
  }
}
