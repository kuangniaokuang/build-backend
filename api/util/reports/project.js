const eeQuery = require('../eeQuery')
const queryBuilder = require('../queryBuilder')

const arrays = require('../arrays')
const {
  getDeveloperDevEqUngrouped
} = require('../analyticsApi/reportData')
const { metrics } = require('../../constants/reports')
const ProjectUtil = require('../project')

module.exports = {
  async getRankForProject (user, project, startDate, endDate) {
    const query = queryBuilder.getUsersInProjectThatHaveCodeContributions(project.gitUrl)
    const allUsersInProject = await eeQuery.execute(query.sql, query.values)

    let arrUsers = allUsersInProject[0].map((row) => { return row.author_email })
    arrUsers = arrays.removeBlacklistEmails(arrUsers)

    if (arrUsers.length === 0) {
      arrUsers = user.emails
    }

    const devValueForAllDevsInProject = await getDeveloperDevEqUngrouped(
      arrUsers,
      project.gitUrl,
      startDate,
      endDate,
      metrics.devValue
    )

    return {
      gitUrl: project.gitUrl,
      name: project.name,
      position: arrays.getMostRecentRank(devValueForAllDevsInProject, user.emails),
      contributors: allUsersInProject[0].length
    }
  },

  async getMyReposDevValueDevEqQuality (user) {
    const query = queryBuilder.getMyReposDevValueDevEqQuality(user)
    const results = await eeQuery.execute(query.sql, query.values)
    return results[0]
  },

  async topContributions (user) {
    const projects = await ProjectUtil.getAllByUserId(user.id)
    const projectIds = projects.map(project => { return project.eeProjectId })
    const query = queryBuilder.topContributions(user.emails, projectIds)
    const topContributions = await eeQuery.execute(query.sql, query.values)

    return topContributions[0]
  }
}
