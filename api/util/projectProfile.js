const { getElocMetricsForProject, getProjectDevRankings } = require('./analyticsApi/reportData')
const { getIntervalForReport } = require('./reports/common')
const { getPrCountsForProject } = require('./pullRequest')
const { formatDevRankingMetricsForProject } = require('./apiResponseFormatter')

module.exports = {
  async getPublicProfile (project, startDate, endDate) {
    const gitUrl = project.get('gitUrl')

    const interval = await getIntervalForReport([gitUrl], [], startDate, endDate)
    const elocData = await getElocMetricsForProject(gitUrl, startDate, endDate, interval)
    const { stats } = await getPrCountsForProject(gitUrl, startDate, endDate)
    // the `nobodyemail` is meant to be there. It's part of a hack to make the example repo work
    const devRankings = await getProjectDevRankings(gitUrl, startDate, endDate, 'nobodyemail@notadomain.co')

    return {
      topContributors: devRankings.map(formatDevRankingMetricsForProject),
      velocity: elocData.map(projectData => {
        return {
          date: projectData.date,
          elocs: projectData.elocs
        }
      }),
      population: elocData.map(projectData => {
        return {
          date: projectData.date,
          contributors: projectData.population
        }
      }),
      merges: stats,
      interval
    }
  }
}
