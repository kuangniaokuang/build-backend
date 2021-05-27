const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')
const { mockRequest, mockResponse } = require('mock-req-res')

const { User, UserEmail } = require('../../db/models')
const QualityController = require('../../api/controllers/QualityController')

chai.use(sinonChai)

describe('QualityController', () => {
  let user

  before(async () => {
    const userId = 2

    user = await User.findByPk(userId, {
      include: UserEmail
    })

    user = user.dataValues
    user.emails = user.UserEmails.map(userEmail => userEmail.get('email'))
  })

  describe ('qualityOverview', () => {
    it ('returns quality overview', async () => {
      const req = mockRequest({
        user,
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-02-13T14:08:35.408-08:00',
          gitUrl: 'git://github.com/mericoqa1/710-loc-python.git',
          range: 'all'
        }
      })
      const res = mockResponse()

      await QualityController.reportMetrics(req, res)

      expect(res.status).to.have.been.calledWith(200)
      const data = res.send.args[0][0].data
      expect(data).to.have.length(1)
      const reportMetrics = data[0]
      expect(reportMetrics.project_id).to.equal("a1eb4c6d-8739-4b4f-8430-739ac542aac1")
      expect(reportMetrics.issue_density).to.equal(0)
      expect(reportMetrics.quality).to.equal(54.122164726257324)
      expect(reportMetrics.code_reusability).to.equal(1)
      expect(reportMetrics.modularity).to.equal(63.9886589050293)
      expect(reportMetrics.static_test_coverage).to.equal(0)
      expect(reportMetrics.doc_coverage).to.equal(52.5)
    })
  })
})
