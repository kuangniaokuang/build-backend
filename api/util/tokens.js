const { User } = require('../../db/models')

module.exports = {
  getTokensForUser: async (userId) => {
    const user = await User.findByPk(userId, {
      attributes: ['githubAccessToken', 'githubRefreshToken', 'gitlabAccessToken', 'gitlabRefreshToken']
    })

    return user && user.dataValues
  }
}
