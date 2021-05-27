'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'Projects',
        'latestProtobuf', {
          type: Sequelize.STRING
        }, {
          transaction
        }
      )

      await queryInterface.sequelize.query('UPDATE "Projects" SET "latestProtobuf" = \'f43hf97f834jf4_84hfi37\'', { transaction })

      await transaction.commit()
    } catch (err) {
      console.log('INFO >>> err', err)
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('Projects', 'latestProtobuf', {
        transaction
      })
      await transaction.commit()
    } catch (err) {
      console.log('INFO >>> err', err)
      await transaction.rollback()
      throw err
    }
  }
}
