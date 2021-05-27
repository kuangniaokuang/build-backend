const ceQuery = require('../api/util/ceQuery')
const dbConfig = require('../config/env/resolveConfig').custom.ceDatabase
const localDbConfig = require('../config/local').custom.ceDatabase
const { execSync } = require('child_process')

module.exports = {
  async createNewDatabaseForTest (config = dbConfig) {
    if (process.env.NODE_ENV === 'localTesting') {
      await ceQuery.rawQuery(`
        CREATE DATABASE "${config.database}";
      `, [], localDbConfig)
    }

    await ceQuery.rawQuery(`
      CREATE EXTENSION pg_trgm;
      CREATE EXTENSION btree_gin;
    `, [], config)
  },

  async insertTestData (config = dbConfig) {
    execSync(`./test/restore_db.sh ${config.database} ${config.host} ${config.password} ${config.username}`)
  },

  async tearDownDatabase (config = dbConfig) {
    if (process.env.NODE_ENV === 'testing') {
      return
    }

    console.info('INFO: Tearing down database', config.database)

    await ceQuery.rawQuery(`
      SELECT pid, pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = ? AND pid <> pg_backend_pid();
      DROP SCHEMA IF EXISTS "${config.database}";
    `, [config.database], localDbConfig)

    await ceQuery.rawQuery(`
      DROP DATABASE IF EXISTS "${config.database}";
    `, [], localDbConfig)
  },

  async createTestDB () {
    try {
      await module.exports.createNewDatabaseForTest(dbConfig)
      await module.exports.insertTestData(dbConfig)

      return dbConfig.database
    } catch (error) {
      console.log('INFO >>> error createTestDB: main: ', error.message)
      await module.exports.tearDownDatabase(dbConfig)

      return false
    }
  }
}
