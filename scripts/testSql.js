const { Sequelize } = require('sequelize')
const dbConfig = require('../config/env/resolveConfig').custom.ceDatabase
const DEBUG = process.env.DEBUG

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'postgres',
  port: dbConfig.port,
  logging: DEBUG ? console.log : false
})

const main = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

main()
