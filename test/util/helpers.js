const { zonedTimeToUtc, format } = require('date-fns-tz')

const { User, Project, Badge, UserEmail, UserNotification, PullRequest, Contributor } = require('../../db/models')
const eeQuery = require('../../api/util/eeQuery')
const { findProjectReportState } = require('../../api/util/queryBuilder')

module.exports = {
  formatDate (dateString) {
    return new Date(dateString)
  },
  async findLastCreatedUser() {
    return await User.findOne({
      order: [
        ['createdAt', 'DESC']
      ]
    })
  },
  async findAndCountProjectsInCE(userId) {
    const projects = await Project.findAndCountAll({
      include: [{
        model: User,
        where: { id: userId }
      }]
    })

    return projects
  },
  async countProjectsInEE(eeProjectIds) {
    const projects = await eeQuery.execute('SELECT COUNT(*) FROM projects WHERE id = ANY(ARRAY[?]::uuid[])', eeProjectIds)

    return parseInt(projects[0][0]['count'])
  },
  async getProject(projectId) {
    return await Project.findByPk(projectId, {
      include: [{
        model: User
      }]
    })
  },
  async findUser(where) {
    return await User.findOne({
      where,
      include: [{
        model: UserEmail
      }]
    })
  },
  async findBadge(where) {
    return await Badge.findOne({
      where,
      order: [
        ['id', 'ASC']
      ],
      include: [{
        all: true
      }]
    })
  },
  async findUserNotification(where) {
    return await UserNotification.findOne({
      where
    })
  },
  async rawQuery(query, values) {
    return await eeQuery.execute(query, values)
  },

  async findPullRequests(where) {
    return await PullRequest.findAll({ where })
  },

  async findContributorByEmail (email) {
    return await Contributor.findOne({where: { email }})
  },

  async deleteContributorsById (ids) {
    return await Contributor.destroy({
      where: {
        id: ids
      }
    })
  }
}
