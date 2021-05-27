'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Badges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'BadgeTypes'
          },
          key: 'code',
        },
        allowNull: false
      },     
      grade: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ['GOLD', 'SILVER', 'BRONZE', 'IRON', 'NONE']
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING
      },
      rankNumerator: {
        type: Sequelize.STRING
      },
      rankDenominator: {
        type: Sequelize.STRING
      },        
      imageUrl: {
        allowNull: false,
        type: Sequelize.STRING
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
      project: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Projects'
          },
          key: 'id',
        },
        allowNull: true
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
      },      
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }, 
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }         
    });
  },
  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('Badges');
      let sql = 'DROP TYPE "enum_Badges_grade";'
      await queryInterface.sequelize.query(sql)
    } catch (err) {
      throw err;
    }
  }
};
