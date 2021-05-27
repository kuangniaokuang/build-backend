const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')
const { mockRequest, mockResponse } = require('mock-req-res')

const { User, UserEmail } = require('../../db/models')
const ProductivityController = require('../../api/controllers/ProductivityController')
const { formatDate } = require('../util/helpers')

chai.use(sinonChai)

describe ('ProductivityController', () => {
  let user

  before(async () => {
    const userId = 2

    user = await User.findByPk(userId, {
      include: UserEmail
    })

    user = user.dataValues
    user.emails = user.UserEmails.map(userEmail => userEmail.get('email'))
  })

  describe ('productivityOverview', () => {
    it ('returns productivity overview', async () => {
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

      await ProductivityController.productivityOverview(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        sum: 1489,
        rowCount: 1,
        data: [
          {
            value: 1489,
            date: formatDate('2021-01-07T12:00:00.000Z')
          }
        ],
        interval: 'day'
      })
    })
  })

  describe ('productivityVelocity', () => {
    it ('returns productivity velocity', async () => {
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

      await ProductivityController.productivityVelocity(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        "rowCount": 1,
        "data": [
          {
            "value": 1489,
            "date": formatDate('2021-01-07T12:00:00.000Z')
          }
        ],
        "interval": 'day'
      })
    })
  })

  describe ('productivityRanking', () => {
    it ('returns productivity ranking', async () => {
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

      await ProductivityController.productivityRanking(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        "data": [
          {
            "date": formatDate('2021-01-07T12:00:00.000Z'),
            "rank": 1
          }
        ],
        "contributors": 1,
        "interval": 'day'
      })
    })
  })
})
