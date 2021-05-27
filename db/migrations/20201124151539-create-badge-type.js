'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('BadgeTypes', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        icon: {
          type: Sequelize.TEXT,
          allowNull: true,
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
      let seedDataSql = `
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('trailblazer', 'im a cat', NOW(), NOW());
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('linguist', 'im a cat', NOW(), NOW());
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('multilingual', 'im a cat', NOW(), NOW());
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('topContributor', 'im a cat', NOW(), NOW());
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('contribution', 'im a cat', NOW(), NOW());
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('minesweeper', 'im a cat', NOW(), NOW());
        INSERT INTO public."BadgeTypes"(code, icon, "createdAt", "updatedAt")	VALUES ('testOfTime', 'im a cat', NOW(), NOW());
      `
      await queryInterface.sequelize.query(seedDataSql)
    } catch (error) {
      throw error
    }
  },
  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('BadgeTypes');
    } catch (error) {
      throw error
    }
  }
};
