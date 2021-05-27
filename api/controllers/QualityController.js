const { getQualityMetrics } = require('../util/analyticsApi/reportData')
const { getIntervalForReport } = require('../util/reports/common')
const ProjectUtil = require('../util/project')

module.exports = {
  /**
   * Quality Metrics
   * @see http://demo.meri.co/dashboard/teams/43e05593-568e-4fb7-b01e-8108ff1b1d6b/developers/dc4ba288-a1ed-4402-868e-765cdfb68298
   * x-buffet-code-loc: /code/app/pages/TeamDeveloperPage/Charts/source.js:48:32
   */
  reportMetrics: async (req, res) => {
    try {
      const interval = await getIntervalForReport([req.query.gitUrl], req.user.emails, req.query.startDate, req.query.endDate)
      const data = await getQualityMetrics(req.query.gitUrl, req.query.startDate, req.query.endDate, interval)

      return res.status(200).send({ data })
    } catch (error) {
      console.error('ERROR: reportMetrics: ', error)
      throw error
    }
  },
  multipleReportMetrics: async (req, res) => {
    try {
      const projects = await ProjectUtil.getByFavoritesOrGitUrl(req.query.repositories, req.user)

      const qualityMetrics = await Promise.all(projects.map(async (project) => {
        const interval = await getIntervalForReport([project.gitUrl], req.user.emails, req.query.startDate, req.query.endDate)
        const data = await getQualityMetrics(project.gitUrl, req.query.startDate, req.query.endDate, interval)
        return {
          dataSet: data,
          repository: project
        }
      }))

      return res.status(200).send({ data: qualityMetrics })
    } catch (error) {
      console.error('ERROR: QualityController.js:multipleReportMetrics: ', error)
      throw error
    }
  }
}
