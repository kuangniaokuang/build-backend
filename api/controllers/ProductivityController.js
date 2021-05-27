const eeQuery = require('../util/eeQuery')
const arrays = require('../util/arrays')
const queryBuilder = require('../util/queryBuilder')
const ProjectUtil = require('../util/project')
const DashboardUtil = require('../util/dashboard')
const { getDeveloperDevEqByInterval, getDevEqByIntervalByEmail } = require('../util/analyticsApi/reportData')
const {
  getIntervalForReport
} = require('../util/reports/common')
const { metrics } = require('../constants/reports')

module.exports = {
  productivityOverview: async (req, res) => {
    try {
      const overview = await DashboardUtil.getOverviewByProject(
        req.query.gitUrl,
        req.user,
        req.query.startDate,
        req.query.endDate,
        metrics.devEquivalent
      )

      return res.status(200).send({
        sum: overview.total,
        rowCount: overview.dataSet.length,
        data: overview.dataSet,
        interval: overview.interval
      })
    } catch (error) {
      console.error('ERROR: ProductivityController.js:productivityOverview: ', error)
      throw error
    }
  },
  multipleProductivityOverview: async (req, res) => {
    try {
      const projects = await ProjectUtil.getByFavoritesOrGitUrl(req.query.repositories, req.user)
      const overview = await DashboardUtil.getOverviewByProjects(
        projects,
        req.user,
        req.query.startDate,
        req.query.endDate,
        metrics.devEquivalent
      )

      return res.status(200).send({
        data: overview
      })
    } catch (error) {
      console.error('ERROR: ProductivityController.js:multipleProductivityOverview: ', error)
      throw error
    }
  },
  productivityVelocity: async (req, res) => {
    try {
      const interval = await getIntervalForReport([req.query.gitUrl], req.user.emails, req.query.startDate, req.query.endDate)
      const devEqData = await getDeveloperDevEqByInterval(
        req.user.emails,
        req.query.gitUrl,
        req.query.startDate,
        req.query.endDate,
        metrics.devEquivalent,
        interval
      )

      return res.status(200).send({
        rowCount: devEqData.length,
        data: devEqData,
        interval
      })
    } catch (error) {
      console.error('ERROR: ProductivityController.js:productivityVelocity: ', error)
      throw error
    }
  },
  productivityRanking: async (req, res) => {
    try {
      const query = queryBuilder.getUsersInProjectThatHaveCodeContributions(req.query.gitUrl)
      const result = await eeQuery.execute(query.sql, query.values)
      const productivityRankingData = result[0]

      let arrUsers = productivityRankingData.map((row) => { return row.author_email })
      arrUsers = arrays.removeBlacklistEmails(arrUsers)

      if (arrUsers.length === 0) {
        arrUsers = req.user.emails
      }

      const interval = await getIntervalForReport([req.query.gitUrl], req.user.emails, req.query.startDate, req.query.endDate)
      const devEqData = await getDevEqByIntervalByEmail(
        req.user.emails,
        req.query.gitUrl,
        req.query.startDate,
        req.query.endDate,
        metrics.devEquivalent,
        interval
      )

      return res.status(200).send({
        data: arrays.getDailyRank(devEqData, req.user.emails),
        contributors: productivityRankingData.length,
        interval
      })
    } catch (error) {
      console.error('ERROR: ProductivityController.js:productivityRanking: ', error)
      throw error
    }
  }
}
