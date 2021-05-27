const githubUtil = require('./github')
const badgeUtil = require('./badges')
const userUtil = require('./user')
const Encryption = require('./encryption')
const contributorUtil = require('./contributors')

module.exports = {
  githubHandler: {
    userEmailsChanged (emailUpdates) {
      return emailUpdates.userEmailsUpdate && Array.isArray(emailUpdates.userEmailsUpdate)
        ? emailUpdates.userEmailsUpdate.some(userEmailUpdate => {
            return userEmailUpdate.length > 1 && userEmailUpdate[1] === true
          })
        : emailUpdates.primaryEmailUpdate !== null
    },

    async handleUserExists (oauthUser, ceUser) {
      await ceUser.update({
        githubAccessToken: oauthUser.githubAccessToken,
        githubRefreshToken: oauthUser.githubRefreshToken
      })

      await ceUser.reload()

      const emailUpdates = await githubUtil.addEmailsToUser(ceUser.dataValues, oauthUser.githubAccessToken)

      if (module.exports.githubHandler.userEmailsChanged(emailUpdates)) {
        badgeUtil.regenerateAllBadgesForUser(ceUser.get('id'))
      }

      return ceUser.dataValues
    },

    async handleUserDoesNotExist (userFromOauth, userToCreate) {
      const emails = await githubUtil.getEmails(Encryption.encrypt(userFromOauth.githubAccessToken))
      userToCreate.primaryEmail = githubUtil.findPrimaryEmailAddress(emails)

      const createdUser = await module.exports.createNewUser(userToCreate, { githubUsername: userFromOauth.username }, emails.map(email => email.email))

      await githubUtil.addEmailsToUser(createdUser, Encryption.encrypt(userFromOauth.githubAccessToken))

      return createdUser
    }
  },

  gitlabHandler: {
    async handleUserExists (oauthUser, ceUser) {
      await ceUser.update({
        gitlabAccessToken: oauthUser.gitlabAccessToken,
        gitlabRefreshToken: oauthUser.gitlabRefreshToken
      })

      await ceUser.reload()

      await userUtil.addEmailsToUser(ceUser.dataValues, oauthUser.emails)

      return ceUser.dataValues
    },

    async handleUserDoesNotExist (userFromOauth) {
      const { emails } = userFromOauth

      const createdUser = await module.exports.createNewUser(
        {
          gitlabAccessToken: userFromOauth.gitlabAccessToken,
          gitlabRefreshToken: userFromOauth.gitlabRefreshToken,
          photo: userFromOauth.avatarUrl,
          displayName: userFromOauth.displayName,
          gitlabUsername: userFromOauth.username,
          primaryEmail: emails[0].value
        },
        { gitlabUsername: userFromOauth.username },
        emails.map(email => email.value)
      )

      await userUtil.addEmailsToUser(createdUser, emails)

      return createdUser
    }
  },

  async createNewUser (userToCreate, where, emails) {
    const user = await userUtil.findOrCreateUser(userToCreate, where)

    await module.exports.createGotStartedBadge(user)
    await module.exports.deleteContributor(user.get('id'), emails)

    delete user.dataValues.githubAccessToken
    delete user.dataValues.githubRefreshToken
    delete user.dataValues.gitlabAccessToken
    delete user.dataValues.gitlabRefreshToken

    return user.dataValues
  },

  async createGotStartedBadge (user) {
    try {
      await badgeUtil.createGotStartedBadge(user)
    } catch (error) {
      // Not mission critical, and if we throw here we wreck onboarding
      console.error(error)
    }
  },

  async deleteContributor (newUserId, emails) {
    try {
      await contributorUtil.deleteContributor(newUserId, emails)
    } catch (error) {
      // Not mission critical, and if we throw here we wreck onboarding
      console.error(error)
    }
  }
}
