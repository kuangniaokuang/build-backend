'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      try {
        await queryInterface.addColumn(
          'Projects',
          'priority',
          {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
          },
          { transaction }
        );
      } catch (error) {
        console.log('skipping column since it already exists')
      }
      
      await transaction.commit();
    } catch (err) {
      console.log('INFO >>> err', err)
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Projects', 'priority', { transaction });
      await transaction.commit();
    } catch (err) {
      console.log('INFO >>> err', err)
      await transaction.rollback();
      throw err;
    }
  }
};
