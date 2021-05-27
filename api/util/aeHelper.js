const AEHelper = require('../../common-backend/dist/ae-helper').default
const dbConfig = require('../../config/env/resolveConfig').custom.ceDatabase
const config = require('../../config/env/resolveConfig')

const emailUtil = require('./email')
const badgeUtil = require('./badges')
const projectUtil = require('./project')
const contributorUtil = require('./contributors')
const pullRequestUtil = require('../../api/util/pullRequest')
const { updateBenchmarkRepoOnAnalysisComplete } = require('./benchmarkRepo')
const codeAnalysisUtil = require('./codeAnalysis.js')
const projectStatuses = require('../constants/projectStatuses')
const thresholds = require('../../config/env/thresholds')(process.env.NODE_ENV)
const { MP } = require('../../api/util/mixpanel')

const createAEHelper = () => {
  const options = {
    amqpUrl: config.custom.RABBIT_MQ_URL,
    pgUrl: `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    minio: config.custom.minio,
    grpc: {
      server: config.custom.CA_GRPC_SERVER,
      noSSL: true
    }
  }

  return new AEHelper(options)
}

const trackAnalysisCompleteEvent = (user, message) => {
  try {
    MP.trackAnalysisComplete({ user, ...message })
  } catch (e) {
    console.error(`Mixpanel Tracking Error: onAnalysisComplete/${message.analysisStatus}`, e)
  }
}

module.exports = {
  helper: {
    submitRepo: async () => {}
  },
  getAnalysisStats: async () => {
    return await module.exports.helper.getAnalysisStats({ source_type: 1 })
  },
  connect: async () => {
    module.exports.helper = createAEHelper()
    await module.exports.helper.connect()
  },
  prepareForAnalysis: async (alreadyConnected) => {
    if (!alreadyConnected) {
      await module.exports.connect()
    }

    // Update the front end with progress while repo is analyzing
    module.exports.helper.onProgressChange(async (message) => {
      process.env.DEBUG && console.log('onProgressChange message:', message.gitUrl, message.currentPercent)
      await projectUtil.updateProjectReportProgress(message.reportId, message.currentPercent)
    })

    module.exports.helper.onAnalysisComplete(async (message) => {
      console.log('onAnalysisComplete message:', message)
      const protobufFile = message.reportObjectName
      const { analysisId, reportId, gitUrl, analysisStatus, projectId: eeProjectId } = message

      const projectReportState = await projectUtil.findReportStateByAnalysisId(analysisId)

      if (!projectReportState) {
        console.info('Analysis does not belong to this environment', analysisId)
        return
      }

      const project = await projectUtil.findOneWithAnalysisId({ eeProjectId }, analysisId)

      if (!project) {
        console.info(`Project not found for eeProjectId: ${eeProjectId} (gitlUrl: ${gitUrl})`)
        return
      }

      // There should only be one user because only one user is connected to the analysisId
      const user = project.get('Users')[0]

      if (user) {
        trackAnalysisCompleteEvent(user, message)
      } else {
        console.info(`aeHelper.js, No user found for projectId ${project.get('id')}, but likely due to reanalysis script`)
      }

      if (analysisStatus === 'SUCCESS') {
        try {
          if (project.dataValues.latestProtobuf === protobufFile) {
            console.info('INFO: Analysis was already saved. Not saving again...')
          } else {
            await module.exports.helper.saveReport(message)
          }
          console.log('save report succeed')
        } catch (error) {
          console.log('save report fail', error)
          return
        }

        try {
          // NOW UPDATE ALL THE DATA IN EE THAT NEEDS TO BE UPDATED
          // TODO: need to update this
          await projectUtil.updateProjectReportStateToFinished(reportId, analysisId)
          // TODO: need to update this
          await projectUtil.updateProjectWithAnalysisResults(eeProjectId, projectStatuses.ready, protobufFile, reportId)
        } catch (error) {
          console.log('ERROR: ', error)
        }

        try {
          // Generate all badges for project that was analyzed
          await badgeUtil.analysisComplete(eeProjectId)
        } catch (error) {
          console.log('ERROR: analysisComplete: ', error)
        }

        if (process.env.NODE_ENV !== 'benchmark') {
          const duration = await codeAnalysisUtil.getAnalysisDuration(analysisId)

          if (duration >= thresholds.emailNotifications.analysisComplete.minDuration && user) {
            await emailUtil.sendAnalysisCompleteEmail(user.get('primaryEmail'), project.name, project.gitUrl)
          }
        }

        try {
          await contributorUtil.createContributorsForProject(project, user && user.get('id'))
        } catch (error) {
          console.log('ERROR: createContributorsForProject: ', error)
        }

        try {
          pullRequestUtil.fetchAllForProject(gitUrl, eeProjectId, user && user.get('id'))
        } catch (error) {
          console.log('ERROR: pullRequestUtil.fetchAllForProject: ', error)
        }
      } else {
        // send null as report_id because we failed to create a report, so we can't match on a report_id
        await projectUtil.updateProjectWithAnalysisResults(eeProjectId, projectStatuses.failure, null, null)
        console.error('ERROR: 83hfjknd; onAnalysisComplete status failed ', message)
      }

      if (config.custom.supportsBenchmarkRepos) {
        await updateBenchmarkRepoOnAnalysisComplete(message)
      }
    })
  }
}
