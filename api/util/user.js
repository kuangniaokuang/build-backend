const {
  Op
} = require('sequelize')
const {
  User,
  UserNotification,
  UserEmail,
  DeletedAccount,
  Badge,
  LoginAttempt,
  PullRequest
} = require('../../db/models')
const projectUtil = require('./project')
const converter = require('./eeToCEDataConverter')

module.exports = {
  async me (user) {
    try {
      const { projects: repos } = await converter.getUserProjectsWithEEData(user)

      await module.exports.trackUserLogin(user)

      return {
        user,
        repos
      }
    } catch (error) {
      console.log('ERROR: me: ', error)
      throw error
    }
  },

  async trackUserLogin (user) {
    try {
      await LoginAttempt.create({ UserId: user.id })
    } catch (error) {
      // it's not worth blowing up if we can't track their login
      console.error(error)
    }
  },

  async findOne (where) {
    try {
      return await User.findOne({
        where,
        include: [{
          model: UserEmail
        }]
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  async update (values, where) {
    try {
      return await User.findOne({
        values,
        where
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  async findOneByEmail (email) {
    try {
      return await User.findOne({
        include: {
          model: UserEmail,
          where: {
            email
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  async findOneWithEmails (where) {
    try {
      return await User.findOne({
        include: {
          model: UserEmail,
          where
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  async findOrCreateUser (user, whereClause) {
    try {
      const result = await User.findOrCreate({
        where: whereClause,
        defaults: user
      })

      return result[0]
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async findAll (where) {
    try {
      return await User.findAll({
        where,
        include: {
          model: UserEmail
        }
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async addEmailsToUser (user, emailsArray) {
    // This is needed since this code handles github and gitlab
    user = user[0] ? user[0].dataValues : user
    try {
      let foundUser = await User.findOne({
        where: {
          [Op.or]: [{
            githubUsername: (user.username || user.githubUsername || '')
          }, {
            gitlabUsername: (user.username || user.gitlabUsername || '')
          }]
        }
      })
      foundUser = foundUser.dataValues ? foundUser.dataValues : foundUser[0].dataValues

      for (let i = 0; i < emailsArray.length; i++) {
        const emailObject = emailsArray[i]
        const email = emailObject.email || emailObject.value

        await UserEmail.findOrCreate({
          where: {
            email
          },
          defaults: {
            email,
            UserId: foundUser.id,
            isVerified: true
          }
        })
      }

      if (!foundUser.primaryEmail) {
        await User.update({
          primaryEmail: emailsArray[0].email || emailsArray[0].value
        }, {
          where: {
            id: foundUser.id
          }
        })
      }
    } catch (error) {
      console.error('ERROR: sdkfjie7838: ', error)
      throw new Error(error)
    }
  },
  async deleteSingleUser (user) {
    try {
      await Badge.destroy({
        where: {
          user: user.id || user
        }
      })
      console.log(`INFO: Badges Deleted for user: ${user.id}`)

      await PullRequest.destroy({
        where: {
          user: user.id
        }
      })
      console.log(`INFO: Pull Requests Deleted for user: ${user.id}`)

      await projectUtil.deleteAllByUser(user)

      await UserEmail.destroy({
        where: {
          UserId: user.id || user
        }
      })

      console.log(`INFO: UserEmail Deleted for user: ${user.id}`)
      await UserNotification.destroy({
        where: {
          user: user.id
        }
      })

      console.log(`INFO: LoginAttempt Deleted for user: ${user.id}`)
      await LoginAttempt.destroy({
        where: {
          UserId: user.id
        }
      })

      console.log(`INFO: UserEmail Notifications Deleted for user: ${user.id}`)
      await User.destroy({
        where: {
          id: user.id
        }
      })

      console.log(`INFO: User Deleted for user: ${user.id}`)
      await DeletedAccount.create({
        email: user.email
      })
    } catch (error) {
      console.error('ERROR: asdfh8ehe: ', error)
      throw error
    }
  },

  getEmailsFromUser (user) {
    return user.UserEmails.map((email) => {
      return email.get('email')
    })
  }
}
