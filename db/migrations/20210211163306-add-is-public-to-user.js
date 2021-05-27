'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
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
      await queryInterface.removeColumn('Users', 'isPublic', { transaction });
      await transaction.commit();
    } catch (err) {
      console.log('INFO >>> err', err)
      await transaction.rollback();
      throw err;
    }
  }
};
