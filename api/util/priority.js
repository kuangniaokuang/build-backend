const eeQuery = require('./eeQuery')
const reanalyzeConfig = require('../../config/constants/reanalyze')
const queryBuilder = require('./queryBuilder')
const { Project, UserProject } = require('../../db/models')

module.exports = {
  async refreshPriority (project) {
    let priority = 0

    const userCount = await module.exports.mericoProjectUserCount(project)
    if (userCount > 1) {
      try {
        priority += parseInt(reanalyzeConfig.priority.multipleUsers)
      } catch (error) {
        console.error('Failed to parse int', error)
      }
    }

    const activeUsers = await module.exports.activeUsersForProject(project)
    if (activeUsers.length > 1) {
      try {
        priority += parseInt(reanalyzeConfig.priority.loggedInThisWeek)
      } catch (error) {
        console.error('Failed to parse int', error)
      }
    }

    const commitCount = await module.exports.getProjectCommitsCount(project)
    try {
      priority += parseInt(reanalyzeConfig.priority.commits * parseInt(commitCount[0][0].count))
    } catch (error) {
      console.error('Failed to parse int', error)
    }

    await Project.update({ priority }, { where: { id: project.id } })

    return priority
  },

  async mericoProjectUserCount (project) {
    const mericoUsers = await UserProject.findAll({ where: { ProjectId: project.id } })
    return mericoUsers[0].dataValues.length
  },

  async activeUsersForProject (project) {
    const query = queryBuilder.activeUsersForProject(project)
    return await eeQuery.execute(query.sql, query.values)
  },

  async getProjectCommitsCount (project) {
    const query = queryBuilder.getProjectCommitsCount(project)
    return await eeQuery.execute(query.sql, query.values)
  }
}
