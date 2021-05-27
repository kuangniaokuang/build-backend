const has = require('lodash/has')

const {
  getDeveloperDevEqByInterval,
  getProjectDevRankings,
  getElocMetricsForMultipleProjects
} = require('../util/analyticsApi/reportData')
const { getPrCountsForProject } = require('./pullRequest')
const { getIntervalForReport } = require('./reports/common')
const { formatDevRankingMetricsForProject } = require('./apiResponseFormatter')

module.exports = {
  getOverviewByProject: async (gitUrl, user, startDate, endDate, metric, project) => {
    const interval = await getIntervalForReport([gitUrl], user.emails, startDate, endDate)

    const dataSet = await getDeveloperDevEqByInterval(
      user.emails,
      gitUrl,
      startDate,
      endDate,
      metric,
      interval
    )
    let total = 0
    dataSet.forEach((row) => {
      total += row.value
      row.value = total
    })

    if (project) {
      return {
        dataSet,
        total,
        repository: project,
        interval
      }
    }

    return {
      dataSet,
      total,
      interval
    }
  },
  getOverviewByProjects: async (projects, user, startDate, endDate, metric, interval) => {
    return await Promise.all(projects.map(
      async (project) => {
        return module.exports.getOverviewByProject(project.gitUrl, user, startDate, endDate, metric, project, interval)
      }
    ))
  },

  async getRankingsForGitUrl (gitUrl, startDate, endData, replacementEmail) {
    const rankings = await getProjectDevRankings(gitUrl, startDate, endData, replacementEmail)

    return rankings.map(formatDevRankingMetricsForProject)
  },

  async getOverviewMetrics (gitUrl, startDate, endDate) {
    const interval = await getIntervalForReport([gitUrl], [], startDate, endDate)
    const projectMetrics = await getElocMetricsForMultipleProjects([gitUrl], startDate, endDate, interval)
    const metrics = has(projectMetrics, gitUrl) ? projectMetrics[gitUrl] : []
    const { stats: mergeStats } = await getPrCountsForProject(gitUrl, startDate, endDate, interval)

    return {
      interval,
      velocity: metrics.map(projectData => {
        return {
          date: projectData.date,
          elocs: projectData.elocs
        }
      }),
      population: metrics.map(projectData => {
        return {
          date: projectData.date,
          contributors: projectData.population
        }
      }),
      merges: mergeStats
    }
  }
}
