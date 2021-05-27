const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
should = chai.should();
const sinonChai = require('sinon-chai')
const { mockRequest, mockResponse } = require('mock-req-res')

const PullRequestController = require('../../api/controllers/PullRequestController')
const pullRequestUtil = require('../../api/util/pullRequest')
const { formatDate } = require('../util/helpers')

describe ('PullRequestController', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe ('getPrStats', () => {
    it ('gets stats', async () => {
      const req = mockRequest({
        user: {
          id: 6,
          emails: [
            'github4merico+mericoqa1@s.gonze.com',
            'git@vincenttunru.com',
            'projects@vinnl.nl'
          ]
        },
        query: {
          gitUrl: 'https://gitlab.com/Flockademic/whereisscihub.git',
          startDate: '2000-12-10T14:50:25.788Z',
          endDate: '2021-11-11T14:50:25.788Z',
          userId: '6'
        }
      })

      const res = mockResponse()

      await PullRequestController.getPrStats(req, res)

      expect(res.status).to.have.been.calledWith(200)

      const data = res.send.args[0][0].data

      expect(data).to.deep.equal({
        interval: 'month',
        stats: [
          { date: formatDate('2018-07-01T12:00:00.000Z'), merged: 2, opened: 0 },
          { date: formatDate('2018-08-01T12:00:00.000Z'), merged: 0, opened: 0 },
          { date: formatDate('2018-09-01T12:00:00.000Z'), merged: 0, opened: 0 },
          { date: formatDate('2018-10-01T12:00:00.000Z'), merged: 0, opened: 0 },
          { date: formatDate('2018-11-01T12:00:00.000Z'), merged: 1, opened: 0 }
        ]
      })
    })

    it ('returns 500 with a stack if something goes wrong', async () => {
      sinon.stub(pullRequestUtil, 'getPrCountsForUser').throws('No prs')
      const req = mockRequest({ query: { userId: 6 }, user: { id: 6 } })
      const res = mockResponse()

      await PullRequestController.getPrStats(req, res)

      expect(res.status).to.have.been.calledWith(500)

      expect(res.send.args[0][0].error.meta.stack).to.include('No prs')
    })

    it ('returns 401 if the requesting user is different from the userId param', async () => {
      const req = mockRequest({
        user: {
          id: 6
        },
        query: {
          userId: 4
        }
      })

      const res = mockResponse()

      await PullRequestController.getPrStats(req, res)

      expect(res.status).to.have.been.calledWith(401)
      expect(res.send.args[0][0].error.message).to.equal('Not authorized to view this user\'s data')
    })
  })
})
