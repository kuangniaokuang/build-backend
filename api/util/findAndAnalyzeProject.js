const projectUtil = require('./project')
const codeAnalysis = require('./codeAnalysis')
const eeQuery = require('./eeQuery')
const aeHelper = require('./aeHelper')
const reanalyzeConfig = require('../../config/constants/reanalyze')
const queryBuilder = require('../../api/util/queryBuilder')

module.exports = {
  async findNextProjectToAnalyze () {
    const query = queryBuilder.nextProjectToAnalyze()
    const response = await eeQuery.execute(query.sql, query.values)
    return response && response[0] ? response[0][0] : null
  },

  async setPriorityOnAllProjects () {
    console.log('INFO >>> setting priority on all projects')
    const projects = await projectUtil.findAll()
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i]
      console.log('INFO >>> setting priority on project: ', project.gitUrl)

      await projectUtil.refreshPriority(project)
    }
  },

  async aeHasCapacityToAnalyze () {
    const stats = await aeHelper.getAnalysisStats()
    return (stats.load <= reanalyzeConfig.aeLoadThreshold && stats.waiting_analyses <= reanalyzeConfig.aePendingJobsThreshold && stats.waiting_tasks <= reanalyzeConfig.aePendingJobsThreshold)
  },

  async reanalyzeNextMostImportantProject () {
    await aeHelper.prepareForAnalysis(false)
    const hasCapacity = await module.exports.aeHasCapacityToAnalyze()
    if (hasCapacity) {
      const project = await module.exports.findNextProjectToAnalyze()
      console.log('INFO: reanalyzeNextMostImportantProject', project.gitUrl)
      if (project) {
        await codeAnalysis.reanalyze(project.gitUrl)
        console.log('INFO: reanalyzeNextMostImportantProject >>> repo was sent for analysis: ', project.gitUrl)
      } else {
        console.log('INFO: reanalyzeNextMostImportantProject: There are no extra projects to analyze')
      }
    } else {
      console.log('INFO: reanalyzeNextMostImportantProject: AE does not have capacity')
    }
  }
}

module.exports.reanalyzeNextMostImportantProject()
