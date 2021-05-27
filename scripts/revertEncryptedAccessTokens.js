const User = require('../db/models')
const migrationScript = require('../db/scripts/migrateAccessTokensToEncrypted')

const main = async () => {
  const users = await User.findAll()

  await migrationScript.revertEncryptedTokens(users)
}

main()
