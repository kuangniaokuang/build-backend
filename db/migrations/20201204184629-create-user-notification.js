'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('UserNotifications', {
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
        message: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM('badge', 'account', 'repository', 'generic'),
          allowNull: false,
          defaultValue: 'badge'
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        url: {
          type: Sequelize.STRING,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: null
        }
      });
    } catch (error) {
      throw error
    }
  },
  down: async (queryInterface, Sequelize) => {
    try{
      await queryInterface.dropTable('UserNotifications');
      let sql = 'DROP TYPE "enum_UserNotifications_type";'
      await queryInterface.sequelize.query(sql)    
    } catch (error) {
      throw error
    }
  }
};