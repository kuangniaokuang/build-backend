const { Contributor, User, PullRequest } = require('../../db/models')
const providerUtil = require('./provider')
const reportUtil = require('./reports/common')
const { getPrCounts, getPrCountsForMultipleProjects } = require('./analyticsApi/reportData')

module.exports = {
  async fetchAllForProject (gitUrl, eeProjectId, userId, pageNumber = 1) {
    const pullRequests = await providerUtil.getPullRequestData(gitUrl, userId, pageNumber)

    await Promise.all(pullRequests.map(async (pullRequest) => {
      if (!pullRequest.mergedAt) {
        return
      }

      const contributor = await Contributor.findOne({
        where: {
          remoteId: pullRequest.authorRemoteId,
          provider: pullRequest.provider
        }
      })

      const user = await User.findOne({
        where: {
          [`${pullRequest.provider}Username`]: pullRequest.username // make it variable
        }
      })

      if (!user && !contributor) {
        console.error('No contributor or user for pull request', pullRequest)
        // why not?
        return
      }

      delete pullRequest.authorRemoteId
      delete pullRequest.username

      try {
        await PullRequest.findOrCreate({
          where: {
            remoteId: pullRequest.remoteId
          },
          defaults: {
            ...pullRequest,
            project: eeProjectId,
            author: contributor && contributor.dataValues.id,
            user: user && user.dataValues.id
          }
        })
      } catch (error) {
        // Not worth stopping pr creation just because one of them failed to findOrCreate
        console.log('Failed to create PR: ', pullRequest, '; eeProjectId:', eeProjectId, '; contributor:', contributor && contributor.dataValues, '; user:', user && user.dataValues)
      }
    }))

    if (pullRequests.length > 0) {
      const newNumber = pageNumber + 1
      return await module.exports.fetchAllForProject(gitUrl, eeProjectId, userId, newNumber)
    }

    return pageNumber
  },

  async getPrCountsForUser (userId, emails, gitUrl = null, startDate = null, endDate = null) {
    return module.exports.getPrCounts(gitUrl, emails, userId, null, startDate, endDate)
  },

  async getPrCountsForContributor (contributorId, emails, gitUrl = null, startDate = null, endDate = null) {
    return module.exports.getPrCounts(gitUrl, emails, null, contributorId, startDate, endDate)
  },

  async getPrCountsForProject (gitUrl, startDate, endDate, interval) {
    return await module.exports.getPrCounts(gitUrl, null, null, null, startDate, endDate, interval)
  },

  async getPrCountsForMultipleProjects (gitUrls, startDate, endDate, interval) {
    interval = interval || await reportUtil.getIntervalForReport(gitUrls, [], startDate, endDate)

    return await getPrCountsForMultipleProjects(gitUrls, startDate, endDate, interval)
  },

  async getPrCounts (
    gitUrl = null,
    emails = null,
    userId = null,
    contributorId = null,
    startDate = null,
    endDate = null,
    interval = null
  ) {
    interval = interval || await reportUtil.getIntervalForReport([gitUrl], emails, startDate, endDate)

    const results = await getPrCounts(gitUrl, startDate, endDate, userId, contributorId, interval)

    const stats = results.map(result => {
      return {
        date: result.date,
        merged: parseInt(result.merged),
        opened: parseInt(result.opened)
      }
    })

    return { interval, stats }
  },

  async updatePullRequests (update, where) {
    return await PullRequest.update(update, { where })
  }
}
