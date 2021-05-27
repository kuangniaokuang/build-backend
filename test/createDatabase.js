const createDb = require('../db/createTestDb')

const main = async ()=>{
  await createDb.createNewDatabaseForTest()
  process.exit()
}

main()
