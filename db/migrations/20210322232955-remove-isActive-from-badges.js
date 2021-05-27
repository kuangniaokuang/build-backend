'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    // delete all badges that are not active
    await queryInterface.sequelize.query('DELETE FROM "Badges" WHERE "isActive" = false', { transaction })
    // alter table remove column isActive
    await queryInterface.removeColumn(
      'Badges',
      'isActive',
      { transaction }
    )

    transaction.commit()
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    // add column isActive
    await queryInterface.addColumn(
      'Badges',
      'isActive',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      { transaction }
    )

    // make all rows isActive = true
    await queryInterface.sequelize.query('UPDATE "Badges" SET "isActive" = true', { transaction })

    transaction.commit()
  }
}
