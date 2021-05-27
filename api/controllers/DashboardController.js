const _groupBy = require('lodash/groupBy')

const queryBuilder = require('../util/queryBuilder')
const errors = require('../util/errors')
const eeQuery = require('../util/eeQuery')
const projectUtil = require('../util/project')
const BadgeUtil = require('../util/badges')
const ProjectReportUtil = require('../util/reports/project')
const dashboardUtil = require('../util/dashboard')

const {
  getDevValueByTeam
} = require('../util/analyticsApi/reportData')
const { getIntervalForReport } = require('../util/reports/common')
const {
  formatBadgeForApiResponse,
  formatTopContributionsForApiResponse,
  formatDevValueByTeamForApiResponse,
  formatDevValueByRankingForApiResponse,
  formatErrorResponse
} = require('../util/apiResponseFormatter')

module.exports = {
  topSkills: async (req, res) => {
    try {
      const query = queryBuilder.topSkills(req.user.emails)
      const data = await eeQuery.execute(query.sql, query.values)
      return res.status(200).send({ rowCount: data[0].length, data: data[0] })
    } catch (error) {
      errors.send(res, error, 'ddffd873ued')
    }
  },
  topAchievements: async (req, res) => {
    const userId = req.user.id
    const type = 'linguist'

    try {
      const badges = await BadgeUtil.getAllByUserAndType(
        userId,
        type,
        'rankNumerator',
        'desc',
        6
      )

      return res.status(200).send({ data: badges.map(formatBadgeForApiResponse) })
    } catch (error) {
      console.error('ERROR: DashboardController:projects: ', error)

      return res.status(500).send({
        message: 'unable to list achievements'
      })
    }
  },
  topContributions: async (req, res) => {
    try {
      const data = await ProjectReportUtil.topContributions(req.user)

      return res.status(200).send({
        rowCount: data.length,
        data: data.map(formatTopContributionsForApiResponse)
      })
    } catch (error) {
      errors.send(res, error, 'djfd78d')
    }
  },
  devValueByTeam: async (req, res) => {
    try {
      let gitUrls = req.query.repositories || []
      if (gitUrls.length <= 0) {
        const projects = await projectUtil.getFavorites(req.user)
        gitUrls = projects.map(({ gitUrl }) => gitUrl)
      }
      const interval = await getIntervalForReport(gitUrls, req.user.emails, req.query.startDate, req.query.endDate)

      const reposData = await getDevValueByTeam(gitUrls, req.user.emails, req.query.startDate, req.query.endDate, interval)
      const groupedReposData = _groupBy(reposData, 'project_name')

      const data = []
      for (const [projectName, dataSet] of Object.entries(groupedReposData)) {
        data.push(formatDevValueByTeamForApiResponse(projectName, dataSet))
      }

      return res.status(200).send({ data })
    } catch (error) {
      errors.send(res, error, 'djfd78d')
    }
  },
  // Ranks your place in the team by most recent analysis
  devValueByRanking: async (req, res) => {
    try {
      const projects = await projectUtil.getByFavoritesOrGitUrl(req.query.repositories, req.user)

      const promises = []
      const startDate = req.query && req.query.startDate
      const endDate = req.query && req.query.endDate
      projects.forEach((project) => {
        promises.push(ProjectReportUtil.getRankForProject(req.user, project, startDate, endDate))
      })

      let results = await Promise.all(promises)
      results = results.filter(repo => {
        return repo.contributors !== 0
      })

      return res.status(200).send({ data: results.map(formatDevValueByRankingForApiResponse) })
    } catch (error) {
      console.error('ERROR: impactRanking: ', error)
      throw error
    }
  },

  async overview (req, res) {
    try {
      const { user, query } = req
      const { gitUrl, startDate, endDate } = query
      const sanitizedGitUrl = projectUtil.homogenizeGitUrl(gitUrl)

      const results = await projectUtil.getAllByGitUrl([sanitizedGitUrl])

      if (!results.length > 0) {
        return res.status(404).send(formatErrorResponse('No project found for that gitUrl', { gitUrl }))
      }
      const project = results[0]

      const projectBelongsToUser = project.Users.some(projectUser => projectUser.get('id') === user.id)
      if (!projectBelongsToUser) {
        return res.status(403).send(formatErrorResponse('Project does not belong to user', { gitUrl }))
      }

      const ranking = await dashboardUtil.getRankingsForGitUrl(sanitizedGitUrl, startDate, endDate, user.primaryEmail)
      const { velocity, population, interval, merges } = await dashboardUtil.getOverviewMetrics(sanitizedGitUrl, startDate, endDate)

      return res.status(200).send({
        data: {
          gitUrl: sanitizedGitUrl,
          url: project.url,
          repoName: project.name,
          interval,
          ranking,
          velocity,
          population,
          merges
        }
      })
    } catch (error) {
      console.log(error)

      return res.status(500).send(formatErrorResponse('An unexpected error occurred in DashboardController.overview', { stack: error.stack }))
    }
  }
}
