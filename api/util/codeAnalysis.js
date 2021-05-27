const { v4: uuidv4 } = require('uuid')
const path = require('path')
const rootPath = path.join(__dirname, '../..')
const qb = require(path.join(rootPath, 'api/util/queryBuilder'))
const query = require(path.join(rootPath, 'api/util/eeQuery'))
const projectUtil = require(path.join(rootPath, 'api/util/project'))
const { gitlabPrivateKey } = require('../../config/env/resolveConfig').custom
const { local, staging, testing, localTesting } = require('../../config/constants/environments')
const projectStatuses = require('../../api/constants/projectStatuses')
const { refreshPriority } = require('./priority')
const thresholds = require('../../config/env/thresholds')(process.env.NODE_ENV)

const pathBlacklist = [
  '^((?:[^/]*(?:\\/|$))*)dist\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)build\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)bin\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)doc\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)docs\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)example\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)examples\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)config\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)node_modules\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)vendor\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)target\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)gen\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)generated\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)resource\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)resources\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)static\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)asset\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)assets\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)Godeps\\/((?:[^/]*(?:\\/|$))*)$',
  '^((?:[^/]*(?:\\/|$))*)\\.git\\/((?:[^/]*(?:\\/|$))*)$'
]

const submitRepo = async (
  gitUrl,
  eeProjectId,
  ceProjectId,
  reportId,
  userId,
  options = {}
) => {
  const { helper } = require('./aeHelper')

  const defaultSubmitRepoRequest = {
    git_url: gitUrl,
    project_id: eeProjectId,
    auth_type: 0,
    path_blacklist: pathBlacklist,
    commit_blacklist: [],
    commit_before: options.commitBefore ? options.commitBefore : null,
    commit_after: options.commitAfter ? options.commitAfter : null,
    report_id: reportId,
    analysis_conf: '{"code_quality_conf":{"rules":{"scala:S138":"max=100","flex:S138":"max=100","typescript:S138":"max=200","go:S138":"max=120","php:S138":"max=150","csharpsquid:S138":"max=80","vbnet:S138":"max=100","kotlin:S138":"max=100","javascript:S138":"max=200","ruby:S138":"max=100","squid:S138":"max=100"}},"large_insertions_conf":10000,"large_deletions_conf":10000}'
  }

  const submitRepoRequest = isMericoRepoInRestrictedEnvironment(gitUrl)
    ? modifySubmitRepoRequestForMericoOnlySSH(defaultSubmitRepoRequest, gitUrl)
    : defaultSubmitRepoRequest

  /* eslint-enable */
  return helper.submitRepo(submitRepoRequest).then(async result => {
    console.log('submit repo result:', result)

    if (userId) {
      // this code can be run by cron jobs and does not always have a user
      await projectUtil.updateUserProject(userId, ceProjectId, { latestAnalysisId: result.analysis_id })
    } else {
      console.info(`codeAnalysis.js, No user found for projectId ${eeProjectId}, but likely due to reanalysis script`)
    }

    await updateProjectWithAnalysisId(reportId, result.analysis_id)
  })
}

const updateProjectWithAnalysisId = async (reportId, analysisId) => {
  const { sql, values } = qb.updateProjectReportStateWithAnalysisId(reportId, analysisId)
  await query.execute(sql, values)
}

/**
 * The following two functions are a little hacky, but we need to start dogfooding our own product.
 * So we're adding this functionality just for merico staff. Hence why it isn't well built.
 * This code gives users full access to my (Paul G's) gitlab account. Be careful when working here.
 * @dogfood
*/
const isMericoRepoInRestrictedEnvironment = (gitUrl) => {
  const restrictedEnvironments = [local, staging, testing, localTesting]

  return restrictedEnvironments.includes(process.env.NODE_ENV) &&
  !gitUrl.includes('gitlab.com/merico-dev/ce/example-repository') &&
  gitUrl.includes('https://gitlab.com/merico-dev/')
}

/**
 * @dogfood
*/
const modifySubmitRepoRequestForMericoOnlySSH = (submitRepoRequest, gitUrl) => {
  // Tread carefully here, there be dragons
  return {
    ...submitRepoRequest,
    git_url: gitUrl.replace('https://gitlab.com/', 'git@gitlab.com:'),
    auth_type: 1,
    private_key: gitlabPrivateKey
  }
}

module.exports = {
  defaultAnalysisOptions: {
    commitLimit: thresholds.analysis.commitLimit,
    commitBefore: null,
    commitAfter: null
  },

  analyze: async (gitUrl, userId, options) => {
    try {
      if (!options) {
        options = { ...module.exports.defaultAnalysisOptions }
      }

      const reportId = uuidv4()
      const project = await projectUtil.findOne({ gitUrl })

      await projectUtil.createProjectReportState(project.eeProjectId, reportId)
      await projectUtil.updateProjectForReanalysis(project.id, reportId, projectStatuses.underway)

      if (options.commitLimit && !options.commitBefore && !options.commitAfter && userId) {
        const { commitBefore, commitAfter } = await projectUtil.getCommitRangeForLimit(gitUrl, options.commitLimit, userId)

        options.commitBefore = commitBefore
        options.commitAfter = commitAfter
      }

      await submitRepo(gitUrl, project.eeProjectId, project.id, reportId, userId, options)

      await refreshPriority(project)

      return {
        gitUrl,
        name: project.get('name'),
        reportId,
        options
      }
    } catch (error) {
      console.error('ERROR: codeAnalysis.js:analyze: ', error)
      throw error
    }
  },

  getAnalysisDuration: async (analysisId) => {
    try {
      const durationQuery = qb.getAnalysisDuration(analysisId)
      const durationData = await query.execute(durationQuery.sql, durationQuery.values)

      return durationData[0].length > 0
        ? durationData[0][0].duration
        : 0
    } catch (error) {
      console.error('codeAnalysis:getAnalysisDuration', error)

      return 60
    }
  }
}
