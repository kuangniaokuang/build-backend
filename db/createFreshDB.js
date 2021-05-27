const ceQuery = require('../api/util/ceQuery')
const dbConfig = require('../config/database.json').localhost
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const EE_MIGRATIONS_DIR = path.join(__dirname, '/eeMigrations')
const BASE_MIGRATION_PATH = path.join(EE_MIGRATIONS_DIR, '/base.sql')

const runEEMigration = async (file, config) => {
  // Only execute files that are migrations
  if (file.match(/[0-9].*sql/) !== null) {
    console.log('INFO >>> running migration: ', file)
    const path = `${EE_MIGRATIONS_DIR}/${file}`
    const sql = fs.readFileSync(path, 'utf8')

    return await ceQuery.rawQuery(sql, [], config)
  }
}

const runBaseEEMigration = async (config) => {
  const sql = fs.readFileSync(BASE_MIGRATION_PATH, 'utf8')

  await ceQuery.rawQuery(sql, [], config)
}

module.exports = {
  async runEEMigrations (dbName, config) {
    config.database = dbName

    await runBaseEEMigration(config)

    fs.readdir(EE_MIGRATIONS_DIR, async (err, files) => {
      if (err) {
        throw err
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await runEEMigration(file, config)
      }
    })
  },

  async createNewDatabaseForTest (dbName, config) {
    await ceQuery.rawQuery(`
      CREATE DATABASE "${dbName}" ;
    `, [], config)
  },

  async runCEMigrations (dbName, config) {
    config.database = dbName
    const migrateSequelize = `node node_modules/.bin/sequelize-cli db:migrate --url 'postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}/${dbName}'`
    execSync(migrateSequelize)
  },

  async tearDownDatabase (dbName, config) {
    console.info('INFO: Tearing down database', dbName)
    await ceQuery.rawQuery(`
      DROP SCHEMA IF EXISTS "${dbName}";
    `, [], config)

    await ceQuery.rawQuery(`
      DROP DATABASE IF EXISTS "${dbName}";
    `, [], config)
  }
}

const main = async () => {
  const dbName = 'IntegrationTestDB-CE'
  console.log('INFO >>> attempting to create DB: ', dbName)
  console.log('INFO >>> dbConfg: ', dbConfig)

  try {
    await module.exports.createNewDatabaseForTest(dbName, dbConfig)
    await module.exports.runCEMigrations(dbName, dbConfig)
    await module.exports.runEEMigrations(dbName, dbConfig)
    console.info('INFO >>> DB created successfully!', dbName)
  } catch (error) {
    console.log('INFO >>> error initDb: main: ', error.message)
    await module.exports.tearDownDatabase(dbName, dbConfig)
  }
}

main()
