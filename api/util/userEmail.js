const { UserEmail } = require('../../../db/models')

module.exports = {
  deleteAllByUser: async (user) => {
    try {
      await UserEmail.destroy({
        where: {
          user: user.id || user
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }
}
