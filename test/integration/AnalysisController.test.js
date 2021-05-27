const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')
const { mockRequest, mockResponse } = require('mock-req-res')

const AnalysisController = require('../../api/controllers/AnalysisController')
const codeAnalysis = require('../../api/util/codeAnalysis')
const aeHelper = require('../../api/util/aeHelper')
const Factory = require('../factory')
const mockObjects = require('../util/mockObjects')
const ProjectUtil = require('../../api/util/project')

chai.use(sinonChai)

describe('AnalysisController', () => {
  let user

  beforeEach(async () => {
    user = {
      id: 1
    }
    sinon.stub(aeHelper.helper, 'submitRepo').resolves(mockObjects.messages.submitRepoResponse)
    sinon.stub(ProjectUtil, 'getCommitRangeForLimit').resolves({
      commitBefore: 1600000000,
      commitAfter: 0
    })
    sinon.spy(ProjectUtil, 'homogenizeGitUrl')
  })

  afterEach(async () => {
    sinon.restore()
    user = null
    await Factory.destroyAll()
  })

  describe ('analyzeRepository', () => {
    it('returns 400 if there is no url', async () => {
      const req = mockRequest({
        user: {
          id: user.id
        }
      })
      const res = mockResponse()

      await AnalysisController.analyzeRepository(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.send).to.have.been.calledWith(AnalysisController.errorMessages.INVALID_GIT_URL)
    })

    it('submits repos for analysis using query.gitUrl', async () => {
      const req = mockRequest({
        query: {
          gitUrl: 'git://github.com/mericogold/repo-with-tot.git'
        },
        user: {
          id: user.id
        }
      })
      const res = mockResponse()

      await AnalysisController.analyzeRepository(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(aeHelper.helper.submitRepo).to.have.been.calledOnce
      expect(res.send).to.have.been.calledWith(sinon.match.hasNested('data.reportId', sinon.match.typeOf('string')))
      expect(ProjectUtil.homogenizeGitUrl).to.have.been.calledOnce
    })

    it('submits repos for analysis using query.url', async () => {
      const req = mockRequest({
        query: {
          URL: 'git://github.com/mericogold/repo-with-tot.git'
        },
        user: {
          id: user.id
        }
      })
      const res = mockResponse()

      await AnalysisController.analyzeRepository(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(aeHelper.helper.submitRepo).to.have.been.calledOnce
      expect(res.send).to.have.been.calledWith(sinon.match.hasNested('data.reportId', sinon.match.typeOf('string')))
      expect(ProjectUtil.homogenizeGitUrl).to.have.been.calledOnce
    })

    it ('returns an error if something throws', async () => {
      sinon.stub(codeAnalysis, 'analyze').rejects('No analysis today!')

      const req = mockRequest({
        query: {
          URL: 'git://github.com/mericogold/repo-with-tot.git'
        },
        user: {
          id: user.id
        }
      })
      const res = mockResponse()

      await AnalysisController.analyzeRepository(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send).to.have.been.calledWith(sinon.match({
        error: sinon.match(/No analysis today/),
        code: 'AnalyticsEngineController:analyzeRepository'
      }))
    })
  })
})
