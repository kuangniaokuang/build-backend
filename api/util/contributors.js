const qb = require('../util/queryBuilder')
const eeQuery = require('./eeQuery')
const provider = require('./provider')
const badgeUtil = require('./badges')
const emailUtil = require('./email')
const { getPercentileFromBadge } = require('./badges/linguist')
const { Contributor } = require('../../db/models')
const { types: badgeTypes } = require('../constants/badges')
const { formatBadgeForApiResponse } = require('./apiResponseFormatter')
const repoHosts = require('../constants/repoHosts')
const {
  getUserContributionsByRepository,
  getContributorMetricsForSingleRepo
} = require('./analyticsApi/reportData')
const { getPrCounts, updatePullRequests } = require('./pullRequest')
const { getIntervalForReport } = require('./reports/common')

module.exports = {
  async createContributorsForProject (project, userId = null) {
    userId = userId || await module.exports.getUserIdForProject(project)

    const commits = await module.exports.getNonUserCommits(project.eeProjectId)
    const contributors = []

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i]

      // call github's or gitlab's api and extract user info from that response
      const contributorInfo = await provider.getContributorInfo(commit.hash, project.gitUrl, commit.author_email, commit.author_name, userId)

      // store as contributor
      try {
        const contributor = await Contributor.findOrCreate({
          where: {
            email: contributorInfo.email,
            remoteId: contributorInfo.remoteId,
            provider: contributorInfo.provider
          },
          defaults: contributorInfo
        })

        contributors.push(contributor[0])
      } catch (error) {
        console.error('ERROR: Failed to create contributor: ', contributorInfo, error)
      }
    }

    return contributors
  },

  async getUserIdForProject (project) {
    // We need to do this janky userId fetch because sometimes we don't have a userId
    // but we need to send an authenticated request so we have a higher rate limit.
    // Long term we should get a company api key with our providers

    const users = await project.getUsers()

    return users.length
      ? users[0].get('id')
      : null
  },

  async getNonUserCommits (eeProjectId) {
    const query = qb.getNonUserCommits(eeProjectId)
    const results = await eeQuery.execute(query.sql, query.values)

    return results[0]
  },

  async getProfile (user, contributor, email) {
    return user
      ? module.exports.getProfileFromUser(user, email)
      : module.exports.getProfileFromContributor(contributor)
  },

  getProfileFromUser (user, email) {
    const githubUsername = user.get('githubUsername')
    const gitlabUsername = user.get('gitlabUsername')

    return {
      email,
      userId: user.get('id'),
      displayName: user.get('displayName'),
      username: githubUsername || gitlabUsername,
      profileUrl: githubUsername ? `https://github.com/${githubUsername}` : `https://gitlab.com/${gitlabUsername}`,
      photoUrl: user.get('photo'),
      provider: githubUsername ? repoHosts.github : repoHosts.gitlab
    }
  },

  getProfileFromContributor (contributor) {
    return {
      email: contributor.get('email'),
      userId: null,
      displayName: contributor.get('displayName'),
      username: contributor.get('username'),
      profileUrl: contributor.get('profileUrl'),
      photoUrl: contributor.get('photoUrl'),
      provider: contributor.get('provider')
    }
  },

  async getTopLanguages (userId) {
    const linguistBadges = userId ? await badgeUtil.getAllByUserAndType(userId, badgeTypes.linguist) : []

    return linguistBadges.map(linguistBadge => {
      return {
        language: linguistBadge.get('name').replace('Linguist for ', ''),
        eloc: parseInt(linguistBadge.get('rankNumerator')),
        percentile: getPercentileFromBadge(linguistBadge)
      }
    })
  },

  async getBadges (userId) {
    const badges = userId ? await badgeUtil.getAllByUser(userId) : []

    return badges.map(formatBadgeForApiResponse)
  },

  async findOneByEmail (email) {
    return await Contributor.findOne({
      where: { email }
    })
  },

  async getTopRepositories (emails, startDate, endDate, userId = null, contributorId = null) {
    const results = await getUserContributionsByRepository(emails, startDate, endDate, userId, contributorId)

    return results.map(contribution => {
      return {
        repoName: contribution.project_name,
        gitUrl: contribution.git_url,
        eloc: parseInt(contribution.eloc),
        elocRank: parseInt(contribution.eloc_rank),
        impact: parseFloat(contribution.dev_value.toFixed(2)),
        impactRank: parseInt(contribution.impact_rank),
        merges: parseInt(contribution.merged),
        mergeRank: parseInt(contribution.merge_rank)
      }
    })
  },

  async getProgressMetrics (gitUrl, emails, startDate = null, endDate = null, userId = null, contributorId = null) {
    const interval = await getIntervalForReport([gitUrl], emails, startDate, endDate)
    const results = await getContributorMetricsForSingleRepo(gitUrl, emails, startDate, endDate, interval)
    const { stats: merges } = await getPrCounts(gitUrl, emails, userId, contributorId, startDate, endDate)
    const commits = await module.exports.getLatestCommits(gitUrl, emails, startDate, endDate)

    const [progress, velocity, impact] = [[], [], []]

    results.forEach(period => {
      progress.push({
        date: period.date,
        eloc: period.cumulative_elocs
      })

      velocity.push({
        date: period.date,
        eloc: period.elocs
      })

      impact.push({
        date: period.date,
        impact: period.dev_value_impact
      })
    })

    const latestCommits = commits.map(commit => {
      return {
        date: commit.commit_timestamp,
        message: commit.message,
        eloc: commit.dev_equivalent,
        impact: commit.dev_value
      }
    })

    return {
      progress,
      velocity,
      impact,
      latestCommits,
      merges,
      interval
    }
  },

  async getLatestCommits (gitUrl, emails, startDate, endDate) {
    const { sql, values } = qb.getUserCommitsForProject(gitUrl, emails, startDate, endDate, 10, 0)
    const results = await eeQuery.execute(sql, values)

    return results.length
      ? results[0]
      : []
  },

  async sendInvite (email, message, inviterName, inviterEmail) {
    try {
      await emailUtil.sendContributorInvitationToMerico(email, message, inviterName, inviterEmail)

      return true
    } catch (error) {
      console.log(error)
    }

    return false
  },

  async deleteContributor (newUserId, emails) {
    const contributors = await Contributor.findAll({
      where: {
        email: emails
      }
    })

    for (let i = 0; i < contributors.length; i++) {
      const contributor = contributors[i]

      await updatePullRequests({ author: null, user: newUserId }, { author: contributor.get('id') })
      await contributor.destroy()
    }
  }
}
