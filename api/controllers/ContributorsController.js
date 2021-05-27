const isEmail = require('validator/lib/isEmail')
const escape = require('validator/lib/escape')

const userUtil = require('../util/user')
const badgeUtil = require('../util/badges')
const contributorUtil = require('../util/contributors')
const { formatErrorResponse, formatBadgeForApiResponse } = require('../util/apiResponseFormatter')

module.exports = {
  async profile (req, res) {
    try {
      const { email } = req.query

      if (!isEmail(email)) {
        return res.status(400).send(formatErrorResponse('Invalid email format', { email }))
      }

      const user = await userUtil.findOneByEmail(email)
      const userId = user ? user.get('id') : null
      const contributor = userId ? null : await contributorUtil.findOneByEmail(email)

      if (!user && !contributor) {
        return res.status(404).send(formatErrorResponse('No user or contributor found for email', { email }))
      }

      const contributorInfo = await contributorUtil.getProfile(user, contributor, email)
      const topLanguages = userId ? await contributorUtil.getTopLanguages(userId) : []
      const badges = userId ? await contributorUtil.getBadges(userId) : []

      return res.status(200).send({
        data: {
          ...contributorInfo,
          topLanguages,
          badges
        }
      })
    } catch (error) {
      console.error('ERROR: ContributorsController:profile: ', error)

      return res.status(500).send(formatErrorResponse('Something went wrong in ContributorsController:profile', { stack: error.stack }))
    }
  },

  async topRepositories (req, res) {
    try {
      const { email, startDate, endDate } = req.query

      if (!isEmail(email)) {
        return res.status(400).send(formatErrorResponse('Invalid email format', { email }))
      }

      const contributor = await contributorUtil.findOneByEmail(email)

      const user = await userUtil.findOneByEmail(email)
      if (!user && !contributor) {
        return res.status(404).send(formatErrorResponse('No user or contributor found for email', { email }))
      }

      // this user/contributor stuff is so messy. We will clean it up with the new DB models
      const userId = user ? user.get('id') : null
      const contributorId = contributor ? contributor.get('id') : null
      const userWithAllEmails = userId ? await userUtil.findOne({ id: user.get('id') }) : null
      const emails = user ? userUtil.getEmailsFromUser(userWithAllEmails) : [contributor.get('email')]

      const topRepositories = await contributorUtil.getTopRepositories(emails, startDate, endDate, userId, contributorId)

      res.status(200).send({
        data: topRepositories
      })
    } catch (error) {
      console.error('ERROR: ContributorsController:topRepositories: ', error)

      return res.status(500).send(formatErrorResponse('Something went wrong in ContributorsController:topRepositories', { stack: error.stack }))
    }
  },

  async progress (req, res) {
    try {
      const { email, gitUrl, startDate, endDate } = req.query

      if (!isEmail(email)) {
        return res.status(400).send(formatErrorResponse('Invalid email format', { email }))
      }

      const user = await userUtil.findOneByEmail(email)
      const userId = user ? user.get('id') : null
      const contributor = userId ? null : await contributorUtil.findOneByEmail(email)

      if (!user && !contributor) {
        return res.status(404).send(formatErrorResponse('No user or contributor found for email', { email }))
      }

      const userWithAllEmails = userId ? await userUtil.findOne({ id: userId }) : null
      const emails = user ? userUtil.getEmailsFromUser(userWithAllEmails) : contributor.get('email')

      const { progress, velocity, impact, merges, latestCommits, interval } = await contributorUtil.getProgressMetrics(
        gitUrl,
        emails,
        startDate,
        endDate,
        userId,
        contributor && contributor.get('id')
      )

      return res.status(200).send({
        data: {
          gitUrl,
          progress,
          velocity,
          impact,
          merges,
          latestCommits,
          interval
        }
      })
    } catch (error) {
      console.error('ERROR: ContributorsController:progress: ', error)

      return res.status(500).send(formatErrorResponse('Something went wrong in ContributorsController:progress', { stack: error.stack }))
    }
  },

  async badges (req, res) {
    try {
      const { email } = req.query

      if (!isEmail(email)) {
        return res.status(400).send(formatErrorResponse('Invalid email format', { email }))
      }

      const user = await userUtil.findOneByEmail(email)
      if (!user) {
        // we should return a not-found, but the frontend needs a 200 for now
        return res.status(200).send({ data: [] })
      }

      const badges = await badgeUtil.getAllByUser(user.get('id'))

      return res.status(200).send({
        data: badges.map(formatBadgeForApiResponse)
      })
    } catch (error) {
      console.error('ERROR: ContributorsController:badges: ', error)

      return res.status(500).send(formatErrorResponse('Something went wrong in ContributorsController:badges', { stack: error.stack }))
    }
  },

  async invite (req, res) {
    try {
      const { contributorEmail, message } = req.body
      const { user } = req

      if (!isEmail(contributorEmail)) {
        return res.status(400).send(formatErrorResponse('Invalid email format for contributor email', { contributorEmail }))
      }

      const contributor = await contributorUtil.findOneByEmail(contributorEmail)
      if (!contributor) {
        return res.status(400).send(formatErrorResponse('No contributor for that email', { contributorEmail }))
      }

      const sanitizedMessage = escape(message)

      const sent = await contributorUtil.sendInvite(contributorEmail, message, user.displayName, user.primaryEmail)

      if (!sent) {
        return res.status(500).send(formatErrorResponse('Failed to send invite', { contributorEmail, message: sanitizedMessage }))
      }

      return res.status(200).send({
        contributorEmail,
        message: sanitizedMessage
      })
    } catch (error) {
      console.error('ERROR: ContributorsController:invite: ', error)

      return res.status(500).send(formatErrorResponse('Something went wrong in ContributorsController:invite', { stack: error.stack }))
    }
  }
}
