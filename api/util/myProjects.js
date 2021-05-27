const { has } = require('lodash')
const projectUtil = require('./project')
const { getElocMetricsForMultipleProjects, getQualityForMultipleProjects } = require('./analyticsApi/reportData')
const { getIntervalForReport } = require('./reports/common')
const { getPrCountsForMultipleProjects } = require('./pullRequest')

function errorFactory (error, meta) {
  return { error, meta }
}

function formatQuality (quality) {
  return {
    docCoverage: +(quality.doc_coverage.toFixed(2)),
    codeReusability: +(quality.code_reusability.toFixed(2)),
    modularity: +(quality.modularity.toFixed(2)),
    staticTestCoverage: +(quality.static_test_coverage.toFixed(2)),
    overall: +(quality.overall.toFixed(2))
  }
}

module.exports = {
  async getMetricsForGitUrls (gitUrls, startDate, endDate, userId) {
    const interval = await getIntervalForReport(gitUrls, [], startDate, endDate)
    const projects = await projectUtil.getAllByGitUrl(gitUrls)
    const elocData = await getElocMetricsForMultipleProjects(gitUrls, startDate, endDate, interval)
    const qualityData = await getQualityForMultipleProjects(gitUrls, startDate, endDate)
    const pullRequestData = await getPrCountsForMultipleProjects(gitUrls, startDate, endDate, interval)

    return gitUrls.map(gitUrl => {
      const project = projects.find(project => project.gitUrl === gitUrl)
      if (!project) {
        return errorFactory('Could not find a project with that gitUrl', { gitUrl })
      }

      if (!project.Users.some(user => user.get('id') === userId)) {
        return errorFactory('Project does not belong to user', { gitUrl, userId })
      }

      const contributionData = has(elocData, gitUrl) ? elocData[gitUrl] : null
      if (!contributionData) {
        return errorFactory('Could not find analysis data for that gitUrl', { gitUrl, repoName: project.name })
      }

      const prData = has(pullRequestData, gitUrl) ? pullRequestData[gitUrl] : []

      return {
        gitUrl: project.gitUrl,
        url: project.url,
        repoName: project.name,
        interval,
        progress: contributionData.map(projectData => {
          return {
            date: projectData.date,
            elocs: projectData.cumulative_elocs
          }
        }),
        velocity: contributionData.map(projectData => {
          return {
            date: projectData.date,
            elocs: projectData.elocs
          }
        }),
        population: contributionData.map(projectData => {
          return {
            date: projectData.date,
            contributors: projectData.population
          }
        }),
        merges: prData.map(stats => {
          return {
            date: stats.date,
            merged: parseInt(stats.merged),
            opened: parseInt(stats.opened)
          }
        }),
        quality: !has(qualityData, gitUrl)
          ? errorFactory('No report found within date range', { gitUrl, startDate, endDate })
          : formatQuality(qualityData[gitUrl][0])
      }
    })
  }
}
