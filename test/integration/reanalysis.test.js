const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')

const reanalysis = require('../../api/util/reanalysis')
const aeHelper = require('../../api/util/aeHelper')
const codeAnalysis = require('../../api/util/codeAnalysis')

const mockObjects = require('../util/mockObjects')

chai.use(sinonChai)

describe ('reanalysis.js', () => {
  const hasCapacityStats = {
    load: 0.5,
    waiting_analyses: 1,
    waiting_tasks: 2
  }

  const noCapacityStats = {
    load: 0.8,
    waiting_analyses: 4,
    waiting_tasks: 5
  }

  beforeEach(() => {
    sinon.stub(aeHelper, 'prepareForAnalysis').resolves('I am prepared')
    sinon.stub(aeHelper.helper, 'submitRepo').resolves(mockObjects.messages.submitRepoResponse)
    sinon.spy(codeAnalysis, 'analyze')
  })

  afterEach(() => {
    sinon.restore()
  })

  describe ('reanalyzeNextMostImportantProject', () => {
    it ('submits the right project for analysis', async () => {
      sinon.stub(aeHelper, 'getAnalysisStats').resolves(hasCapacityStats)

      const expectedProjectGitUrl = 'https://gitlab.com/merico-dev/ce/ce-backend.git'

      await reanalysis.reanalyzeNextMostImportantProject()

      expect(codeAnalysis.analyze).to.have.been.calledWith(expectedProjectGitUrl)
    })

    it ('does not submit a project if ae does not have capacity', async () => {
      sinon.stub(aeHelper, 'getAnalysisStats').resolves(noCapacityStats)

      await reanalysis.reanalyzeNextMostImportantProject()

      expect(codeAnalysis.analyze).to.have.not.have.been.called
    })

    it ('does not attempt analysis if it cannot find a project', async () => {
      sinon.stub(aeHelper, 'getAnalysisStats').resolves(hasCapacityStats)
      sinon.stub(reanalysis, 'findNextProjectToAnalyze').resolves(null)

      await reanalysis.reanalyzeNextMostImportantProject()

      expect(codeAnalysis.analyze).to.have.not.have.been.called
    })
  })
})
