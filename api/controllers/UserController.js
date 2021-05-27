
const { User, UserEmail } = require('../../db/models')
const userUtil = require('./../util/user')
const badgeUtil = require('../util/badges')
const { formatExtendedUserForApiResponse } = require('../util/apiResponseFormatter')

const emailsWereAddedOrRemoved = (accountUpdateResults, removeEmails, emails) => {
  if (removeEmails.length && accountUpdateResults.length) {
    for (let i = 0; i < removeEmails.length; i++) {
      if (typeof accountUpdateResults[i] !== 'undefined' && accountUpdateResults[i] === 1) {
        return true
      }
    }
  }

  if (emails.length && accountUpdateResults.length) {
    for (let i = removeEmails.length - 1; i < accountUpdateResults.length; i++) {
      if (typeof accountUpdateResults[i] !== 'undefined' && accountUpdateResults[i].length === 2 && accountUpdateResults[i][1] === true) {
        return true
      }
    }
  }

  return false
}

module.exports = {
  me: async (req, res) => {
    try {
      const extendedUser = await userUtil.me(req.user)

      return res.status(200).send(formatExtendedUserForApiResponse(extendedUser))
    } catch (error) {
      return res.status(500).send(error.message)
    }
  },
  setIsOnboarded: async (req, res) => {
    try {
      await User.update({
        isOnboarded: true
      }, {
        where: {
          id: req.user.id
        }
      })
      return res.status(200).send('User isOnboarded updated successfully.')
    } catch (error) {
      return res.status(500).send(error.message || error)
    }
  },
  setIsPublic: async (req, res) => {
    try {
      await User.update({
        isPublic: req.query.isPublic
      }, {
        where: {
          id: req.user.id
        }
      })
      return res.status(200).send('User isPublic updated successfully.')
    } catch (error) {
      return res.status(500).send(error.message || error)
    }
  },
  update: async (req, res) => {
    try {
      const emails = req.body.emails
        ? JSON.parse(req.body.emails)
        : []
      const removeEmails = req.body.removeEmails
        ? JSON.parse(req.body.removeEmails)
        : []

      const promises = []

      removeEmails.forEach(async (removeEmail) => {
        promises.push(UserEmail.destroy({
          where: {
            email: removeEmail,
            UserId: req.user.id
          }
        }))
      })

      emails.forEach(async (email) => {
        promises.push(UserEmail.findOrCreate({
          where: {
            email: email,
            UserId: req.user.id
          },
          defaults: {
            UserId: req.user.id,
            email
          }
        }))
      })

      promises.push(User.update({
        displayName: req.body.displayName,
        website: req.body.website
      }, {
        where: {
          id: req.user.id
        }
      }))

      return Promise.all(promises).then((accountUpdateResults) => {
        if (emailsWereAddedOrRemoved(accountUpdateResults, removeEmails, emails)) {
          badgeUtil.regenerateAllBadgesForUser(req.user.id)
        }

        return res.status(200).send('User updated successfully.')
      })
    } catch (error) {
      console.error('ERROR: User failed to update: ', error)
      return res.status(500).send(error.message || error)
    }
  },
  delete: async (req, res) => {
    // TODO: handle in transaction in case one thing fails - prevents orphaned records
    try {
      // Only allow users to delete their own user
      await userUtil.deleteSingleUser(req.user)
      return res.status(200).send('Account removed successfully.')
    } catch (error) {
      console.error(error)
      return res.status(500).send(error.message || error)
    }
  },
  syncGithub: async (req, res) => {
    return res.status(200).send('Github synced successfully.')
  },
  syncGitlab: async (req, res) => {
    return res.status(200).send('Gitlab synced successfully.')
  }

}
