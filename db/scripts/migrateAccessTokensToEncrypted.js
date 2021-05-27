const { User } = require('../models')
const Encryption = require('../../api/util/encryption')

const getKeyFromObject = (obj) => {
  return obj ? Object.keys(obj)[0] : ''
}

module.exports = {
  async updateUserColumnToEncryptedHash (transaction) {
    try {
      const users = await User.findAll({
        attributes: {
          include: [],
          exclude: []
        },
        transaction
      })

      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        await User.update({
          githubAccessToken: Encryption.encrypt(getKeyFromObject(user.dataValues.githubAccessToken)),
          githubRefreshToken: Encryption.encrypt(getKeyFromObject(user.dataValues.githubRefreshToken)),
          gitlabAccessToken: Encryption.encrypt(getKeyFromObject(user.dataValues.gitlabAccessToken)),
          gitlabRefreshToken: Encryption.encrypt(getKeyFromObject(user.dataValues.gitlabRefreshToken))
        }, {
          where: {
            id: user.dataValues.id
          },
          transaction
        })
      }
      return
    } catch (error) {
      console.log('ERROR: updateUserColumnToEncryptedHash: ', error)
      await transaction.rollback()
    }
  },
  async revertEncryptedTokens (users, transaction) {
    try {
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const options = {
          githubAccessToken: Encryption.decrypt(user.dataValues.githubAccessToken),
          githubRefreshToken: Encryption.decrypt(user.dataValues.githubRefreshToken),
          gitlabAccessToken: Encryption.decrypt(user.dataValues.gitlabAccessToken),
          gitlabRefreshToken: Encryption.decrypt(user.dataValues.gitlabRefreshToken)
        }
        await User.update(options, {
          where: {
            id: user.dataValues.id
          },
          transaction,
          returning: true,
          hooks: false
        })
      }

      return
    } catch (error) {
      console.log('ERROR: updateUserColumnToEncryptedHash: ', error)
    }
  }
}
