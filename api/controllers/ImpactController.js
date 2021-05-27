const eeQuery = require('../util/eeQuery')
const arrays = require('../util/arrays')
const queryBuilder = require('../util/queryBuilder')
const ProjectUtil = require('../util/project')
const {
  getIntervalForReport
} = require('../util/reports/common')
const { metrics } = require('../constants/reports')
const { getDeveloperDevEqByInterval, getDevEqByIntervalByEmail, getRelativeDeveloperDevEqByInterval } = require('../util/analyticsApi/reportData')
const { formatBasicProjectForApiResponse } = require('../util/apiResponseFormatter')

module.exports = {
  impactOverview: async (req, res) => {
    try {
      const { gitUrl, startDate, endDate } = req.query
      const { emails } = req.user
      const interval = await getIntervalForReport([gitUrl], emails, startDate, endDate)
      const dataSet = await getRelativeDeveloperDevEqByInterval(emails, gitUrl, startDate, endDate, metrics.devEquivalent, interval)

      return res.status(200).send({
        sum: 0,
        rowCount: dataSet.length,
        data: dataSet,
        interval
      })
    } catch (error) {
      console.error('ERROR: impactOverview: ', error)
      throw error
    }
  },
  multipleImpactOverview: async (req, res) => {
    try {
      const { startDate, endDate } = req.query
      const { emails } = req.user

      const projects = await ProjectUtil.getByFavoritesOrGitUrl(req.query.repositories, req.user)

      const projectsImpact = await Promise.all(projects.map(async project => {
        const interval = await getIntervalForReport([project.gitUrl], emails, startDate, endDate)
        const dataSet = await getRelativeDeveloperDevEqByInterval(emails, project.gitUrl, startDate, endDate, metrics.devEquivalent, interval)

        return {
          total: 0,
          repository: formatBasicProjectForApiResponse(project),
          dataSet,
          interval
        }
      }))

      return res.status(200).send({
        data: projectsImpact
      })
    } catch (error) {
      console.error('ERROR: ImpactController.js:multipleImpactOverview: ', error)
      throw error
    }
  },
  impactVelocity: async (req, res) => {
    try {
      const interval = await getIntervalForReport([req.query.gitUrl], req.user.emails, req.query.startDate, req.query.endDate)
      const devEqData = await getDeveloperDevEqByInterval(req.user.emails, req.query.gitUrl, req.query.startDate, req.query.endDate, metrics.devValue, interval)

      return res.status(200).send({
        rowCount: devEqData.length,
        data: devEqData,
        interval
      })
    } catch (error) {
      console.error('ERROR: impactVelocity: ', error)
      throw error
    }
  },
  impactRanking: async (req, res) => {
    try {
      const query = queryBuilder.getUsersInProjectThatHaveCodeContributions(req.query.gitUrl)
      const data = await eeQuery.execute(query.sql, query.values)

      let arrUsers = data[0].map((row) => { return row.author_email })
      arrUsers = arrays.removeBlacklistEmails(arrUsers)

      if (arrUsers.length === 0) {
        arrUsers = req.user.emails
      }

      const interval = await getIntervalForReport([req.query.gitUrl], req.user.emails, req.query.startDate, req.query.endDate)
      const devEqData = await getDevEqByIntervalByEmail(arrUsers, req.query.gitUrl, req.query.startDate, req.query.endDate, metrics.devValue, interval)

      return res.status(200).send({
        data: arrays.getDailyRank(devEqData, req.user.emails),
        contributors: data[0].length,
        interval
      })
    } catch (error) {
      console.error('ERROR: impactRanking: ', error)
      throw error
    }
  },
  impactCommits: async (req, res) => {
    const emails = req.user.emails
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const search = req.query.search

    try {
      const countQuery = queryBuilder.getUserCommitsForProject(req.query.gitUrl, emails, req.query.startDate, req.query.endDate, limit, offset, req.query.sortColumn, req.query.sortDirection, true, search)
      const count = await eeQuery.execute(countQuery.sql, countQuery.values)

      const query = queryBuilder.getUserCommitsForProject(req.query.gitUrl, emails, req.query.startDate, req.query.endDate, limit, offset, req.query.sortColumn, req.query.sortDirection, false, search)
      const data = await eeQuery.execute(query.sql, query.values)

      return res.status(200).send({
        totalRecords: count[0][0].count,
        data: data[0]
      })
    } catch (error) {
      console.error('ERROR: impactCommits: ', error)
      throw error
    }
  }
}
