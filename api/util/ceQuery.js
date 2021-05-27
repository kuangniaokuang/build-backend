const { Sequelize, QueryTypes } = require('sequelize')
const dbConfig = require('../../config/env/resolveConfig').custom.ceDatabase
const DEBUG = process.env.DEBUG
const connections = {}

module.exports = {
  // variables: ['Hello world!']
  execute: async (sql, variables, res, callback) => {
    // https://sequelize.org/master/manual/raw-queries.html#replacements
    const sequelize = connections[dbConfig.database] || module.exports.connection()

    try {
      const data = await sequelize.query(
        sql,
        {
          replacements: variables,
          type: QueryTypes.SELECT
        }
      )
      return callback(data)
    } catch (error) {
      console.error(error)
      return res.status(500).send(error.stack)
    }
  },
  rawQuery: async (sql, variables, config = dbConfig) => {
    const sequelize = connections[config.database] || module.exports.connection(config)

    try {
      return await sequelize.query(
        sql,
        {
          replacements: variables
        }
      )
    } catch (error) {
      console.error('Unable to run query', error.message)
      throw error
    }
  },
  connection: (config = dbConfig) => {
    if (!connections[config.database]) {
      const dbConnection = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: 'postgres',
        port: config.port,
        logging: DEBUG ? console.log : false,
        pool: {
          max: 100,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      })
      connections[config.database] = dbConnection
      return dbConnection
    } else {
      return connections[config.database]
    }
  }
}
