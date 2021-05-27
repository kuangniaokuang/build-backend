const { createTestDB, tearDownDatabase } = require('../db/createTestDb')
const { execSync } = require('child_process')

var args = process.argv.slice(2);

const main = async (name) => {
  if (args[0] === 'up') {
    console.log('Creating test db and populating it with data')
    await createTestDB()
    console.log('Test DB created')

    console.log('Running migrations')
    execSync(`NODE_ENV=localTesting npx sequelize-cli db:migrate`)
    console.log('Migrations finished')

    console.log('Done loading test DB')
  } else if (args[0] === 'down') {
    console.log('Tearing down test db')
    await tearDownDatabase()
    console.log('Done tearing down db')
  } else {
    console.log('Invalid or missing argument. Arg: ', $args[0])
  }

  process.exit()
}

main()
