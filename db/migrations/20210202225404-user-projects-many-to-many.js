'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    await queryInterface.createTable('UserProjects', {
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id'
        },
        allowNull: false,
        primaryKey: true
      },
      ProjectId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Projects'
          },
          key: 'id'
        },
        allowNull: false,
        primaryKey: true
      },
      isFavorite: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      },
      latestAnalysisId: {
        type: Sequelize.DataTypes.STRING
      }
    }, { transaction })

    await queryInterface.sequelize.query(`
      INSERT INTO "UserProjects" ("UserId", "ProjectId", "isFavorite")
      SELECT "user", id, COALESCE("isFavorite", false) FROM "Projects"
    `, { transaction })

    await queryInterface.removeColumn('Projects', 'user', { transaction })

    await transaction.commit()
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    await queryInterface.addColumn(
      'Projects',
      'user',
      {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id'
        },
        allowNull: true
      },
      { transaction }
    )

    await queryInterface.sequelize.query(`
      UPDATE "Projects"
      SET "user" = "UserProjects"."UserId"
      FROM "UserProjects"
      WHERE "Projects".id = "UserProjects"."ProjectId"
    `, { transaction })

    await queryInterface.changeColumn(
      'Projects',
      'user',
      {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id'
        },
        allowNull: false
      },
      { transaction }
    )

    await queryInterface.dropTable('UserProjects', { transaction })

    await transaction.commit()
  }
}
