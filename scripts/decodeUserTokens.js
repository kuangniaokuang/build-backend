const Encryption = require('../api/util/encryption')

const {
  User,
  UserEmail
} = require('../db/models')

const main = async (id) => {
  const user = await User.findOne({
    where: { id },
    include: [{
      model: UserEmail
    }],
    attributes: {
      include: ['githubAccessToken', 'githubRefreshToken', 'gitlabAccessToken', 'gitlabRefreshToken'],
      exclude: []
    }
  })

  console.log('info >>> githubAccessToken', Encryption.decrypt(user.dataValues.githubAccessToken))
  console.log('info >>> gitlabAccessToken', Encryption.decrypt(user.dataValues.gitlabAccessToken))
}

main(841)
