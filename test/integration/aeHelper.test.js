const sinon = require('sinon')
const proxyquire =  require('proxyquire')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const { expect } = chai

const config = require('../../config/env/resolveConfig')
const projectUtil = require('../../api/util/project')
const badgeUtil = require('../../api/util/badges')
const emailUtil = require('../../api/util/email')
const contributorUrl = require('../../api/util/contributors')
const pullRequestUtil = require('../../api/util/pullRequest')
const projectStatuses = require('../../api/constants/projectStatuses')
const { rawQuery } = require('../util/helpers')

chai.use(sinonChai)

class AEHelper {
  constructor(options) {
    this.options = options
  }

  connect() {
    this.connected = true
  }

  getOptions() {
    return this.options
  }

  isConnected() {
    return this.connected
  }

  onProgressChange(callback) {
    this.progressChangeCallback = callback
  }

  onAnalysisComplete(callback) {
    this.analysisCompleteCallback = callback
  }

  async saveReport() {
    return
  }
}

const mockAEHelper = {
  default: AEHelper
}

const aeHelper = proxyquire('../../api/util/aeHelper', { '../../common-backend/dist/ae-helper': mockAEHelper})

describe ('aeHelper', () => {
  before(async () => {
    await aeHelper.prepareForAnalysis()
  })

  beforeEach(() => {
    sinon.stub(badgeUtil, 'analysisComplete').resolves('All good, made some badges')
    sinon.stub(emailUtil, 'sendAnalysisCompleteEmail').resolves('All good, send an email')
    sinon.stub(contributorUrl, 'createContributorsForProject').resolves([])
    sinon.stub(pullRequestUtil, 'fetchAllForProject').resolves([])
  })

  afterEach(() => {
    sinon.restore()
  })

  it ('connects', async () => {
    const dbConfig = config.custom.ceDatabase

    expect(aeHelper.helper.isConnected()).to.be.true
    expect(aeHelper.helper.getOptions()).to.deep.equal({
      amqpUrl: config.custom.RABBIT_MQ_URL,
      pgUrl: `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
      minio: config.custom.minio,
      grpc: {
        server: config.custom.CA_GRPC_SERVER,
        noSSL: true
      }
    })
  })

  it ('updates progress', async () => {
    const progressChangeMessage = {
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      currentPercent: 0.5,
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
    }

    await aeHelper.helper.progressChangeCallback(progressChangeMessage)

    const query = `SELECT progress FROM project_report_state WHERE report_id = ?`
    const results = await rawQuery(query, [progressChangeMessage.reportId])

    expect(results[0][0].progress).to.equal(0.5)
  })

  /**
   * I know it's not great practice to make one test depend upon another,
   * but sometimes it's worth it. In this case, we run the failure case
   * followed by the succcess case. Essentially this returns the test db
   * to its normal state. Otherwise we get failures in other areas that
   * depend on the Sestet repo.
   */
  it ('updates the project status to failure if the analysis failed', async () => {
    const analysisCompleteMessage = {
      analysisId: 'f73564bd-00c2-418b-9f66-4280b5767905',
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      analysisStatus: 'FAILURE',
      projectId: '1d52ec14-4719-4c20-b78f-2f5cafe92e58',
    }

    await aeHelper.helper.analysisCompleteCallback(analysisCompleteMessage)

    const projectReadinessQuery = `SELECT "eeStatus", "latestReportId" FROM "Projects" WHERE "eeProjectId" = ?`
    const projectReadinessResults = await rawQuery(projectReadinessQuery, [analysisCompleteMessage.projectId])

    expect(projectReadinessResults[0][0].eeStatus).to.equal(projectStatuses.failure)
  })

  it ('handles successful analysis complete', async () => {
    const analysisCompleteMessage = {
      analysisId: 'f73564bd-00c2-418b-9f66-4280b5767905',
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      analysisStatus: 'SUCCESS',
      projectId: '1d52ec14-4719-4c20-b78f-2f5cafe92e58',
      reportObjectName: 'g9875hg5h458_g78h8745h548'
    }

    await aeHelper.helper.analysisCompleteCallback(analysisCompleteMessage)

    const reportStateQuery = `SELECT status FROM project_report_state WHERE report_id = ? AND analysis_id = ?`
    const reportStateResults = await rawQuery(reportStateQuery, [analysisCompleteMessage.reportId, analysisCompleteMessage.analysisId])

    expect(reportStateResults[0][0].status).to.equal(projectStatuses.ready)

    const projectReadinessQuery = `SELECT "eeStatus", "latestReportId" FROM "Projects" WHERE "eeProjectId" = ?`
    const projectReadinessResults = await rawQuery(projectReadinessQuery, [analysisCompleteMessage.projectId])

    expect(projectReadinessResults[0][0].eeStatus).to.equal(projectStatuses.ready)
    expect(projectReadinessResults[0][0].latestReportId).to.equal(analysisCompleteMessage.reportId)

    expect(badgeUtil.analysisComplete).to.have.been.calledOnce
    expect(emailUtil.sendAnalysisCompleteEmail).to.have.been.calledOnce

    expect(contributorUrl.createContributorsForProject).to.have.been.calledOnce
    expect(pullRequestUtil.fetchAllForProject).to.have.been.calledOnce
  })

  it ('returns early if the analysis id does not match one in our db', async () => {
    sinon.spy(projectUtil, 'findOneWithAnalysisId')
    const analysisCompleteMessage = {
      analysisId: 'f73569cc-00c2-418b-9f66-4280b5767905',
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      analysisStatus: 'SUCCESS',
      projectId: '1d52ec14-4719-4c20-b78f-2f5cafe92e58'
    }

    await aeHelper.helper.analysisCompleteCallback(analysisCompleteMessage)

    expect(projectUtil.findOneWithAnalysisId).to.not.have.been.called
  })

  it ('logs an error and does nothing else if save report fails', async () => {
    sinon.stub(aeHelper.helper, 'saveReport').rejects('Failed to save report')
    sinon.spy(projectUtil, 'updateProjectReportStateToFinished')

    const analysisCompleteMessage = {
      analysisId: 'f73564bd-00c2-418b-9f66-4280b5767905',
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      analysisStatus: 'SUCCESS',
      projectId: '1d52ec14-4719-4c20-b78f-2f5cafe92e58'
    }

    await aeHelper.helper.analysisCompleteCallback(analysisCompleteMessage)

    expect(projectUtil.updateProjectReportStateToFinished).to.not.have.been.called
  })

  it ('does not throw if it cannot find a matching project', async () => {
    sinon.spy(aeHelper.helper, 'saveReport')

    const analysisCompleteMessage = {
      analysisId: 'f73564bd-00c2-418b-9f66-4280b5767905',
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      analysisStatus: 'SUCCESS',
      projectId: '11111111-1111-1111-1111-111111111111',
    }

    await aeHelper.helper.analysisCompleteCallback(analysisCompleteMessage)

    expect(aeHelper.helper.saveReport).to.not.have.been.called
  })

  it ('does not save report if the protobuf file is the same as previous', async () => {
    sinon.spy(aeHelper.helper, 'saveReport')

    const analysisCompleteMessage = {
      analysisId: 'f73564bd-00c2-418b-9f66-4280b5767905',
      reportId: '3e2a92dd-0d75-4d62-99b0-48dc480d1409',
      gitUrl: 'git://github.com/basicthinker/Sestet.git',
      analysisStatus: 'SUCCESS',
      projectId: '1d52ec14-4719-4c20-b78f-2f5cafe92e58',
      reportObjectName: 'g9875hg5h458_g78h8745h548'
    }

    await aeHelper.helper.analysisCompleteCallback(analysisCompleteMessage)

    expect(aeHelper.helper.saveReport).to.not.have.been.called
  })
})
