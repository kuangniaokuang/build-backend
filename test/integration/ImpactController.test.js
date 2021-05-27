const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')
const chaiSubset = require('chai-subset');
const { mockRequest, mockResponse } = require('mock-req-res')

const { User, UserEmail } = require('../../db/models')
const ImpactController = require('../../api/controllers/ImpactController')
const { formatDate } = require('../util/helpers')

chai.use(sinonChai)
chai.use(chaiSubset);

describe ('ImpactController', () => {
  let user

  before(async () => {
    const userId = 2

    user = await User.findByPk(userId, {
      include: UserEmail
    })

    user = user.dataValues
    user.emails = user.UserEmails.map(userEmail => userEmail.get('email'))
  })

  describe ('impactOverview', () => {
    it ('returns impact overview', async () => {
      let user4 = await User.findByPk(4, {
        include: UserEmail
      })

      user4 = user4.dataValues
      user4.emails = user4.UserEmails.map(userEmail => userEmail.get('email'))
      const req = mockRequest({
        user: user4,
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-02-13T14:08:35.408-08:00',
          gitUrl: 'git://github.com/basicthinker/Sestet.git',
          range: 'all'
        }
      })
      const res = mockResponse()

      await ImpactController.impactOverview(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith(
        {
          sum: 0,
          rowCount: 11,
          data: [
            { date: formatDate('2013-02-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-03-01T12:00:00.000Z'), value: 0.6850490196078431 },
            { date: formatDate('2013-04-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-05-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-06-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-07-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-08-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-09-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-10-01T12:00:00.000Z'), value: 0 },
            { date: formatDate('2013-11-01T12:00:00.000Z'), value: 1 },
            { date: formatDate('2013-12-01T12:00:00.000Z'), value: 1 }
          ],
          interval: 'month'
        }
      )
    })
  })

  describe ('multipleImpactOverview', () => {
    it ('returns multiple impact overview', async () => {
      let user4 = await User.findByPk(4, {
        include: UserEmail
      })

      user4 = user4.dataValues
      user4.emails = user4.UserEmails.map(userEmail => userEmail.get('email'))
      const req = mockRequest({
        user: user4,
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-02-13T14:08:35.408-08:00'
        }
      })
      const res = mockResponse()

      await ImpactController.multipleImpactOverview(req, res)

      expect(res.status).to.have.been.calledWith(200)

      expect(res.send.args[0][0].data).to.containSubset([
        {
          total: 0,
          repository: {
            createdAt: new Date('2021-02-11T00:01:52.896Z'),
            id: 7,
            url: 'https://github.com/mericoqa1/test-minesweeper-multi-emails',
            gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
            name: 'test-minesweeper-multi-emails',
            nextProcessing: new Date('2021-02-25T22:56:46.942Z'),
            latestCommitHash: null,
            latestCommitTitle: null,
            latestCommitMessage: null
          },
          dataSet: [ { value: 0.11764705882352941, date: formatDate('2020-12-15T12:00:00.000Z') } ],
          interval: 'day'
        },
        {
          total: 0,
          repository: {
            createdAt: new Date('2021-02-25T19:42:20.963Z'),
            id: 12,
            url: 'https://github.com/basicthinker/Sestet',
            gitUrl: 'git://github.com/basicthinker/Sestet.git',
            name: 'Sestet',
            nextProcessing: new Date('2021-02-26T19:42:21.179Z'),
            latestCommitHash: null,
            latestCommitTitle: null,
            latestCommitMessage: null
          },
          dataSet: [
            { value: 1, date: formatDate('2013-02-01T12:00:00.000Z') },
            { value: 0.6850490196078431, date: formatDate('2013-03-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-04-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-05-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-06-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-07-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-08-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-09-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-11-01T12:00:00.000Z') },
            { value: 1, date: formatDate('2013-12-01T12:00:00.000Z') }
          ],
          interval: 'month'
        }
      ])
    })
  })

  describe ('impactRanking', () => {
    it ('returns impact ranking', async () => {
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

      await ImpactController.impactRanking(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        "data": [
          {
            "date": formatDate('2021-01-07T12:00:00.000Z'),
            "rank": 1
          }
        ],
        "contributors": 1,
        'interval': 'day'
      })
    })
  })

  describe ('impactCommits', () => {
    it ('returns impact commits', async () => {
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

      await ImpactController.impactCommits(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        "totalRecords": "2",
        "data": [
          {
            "project_id": "a1eb4c6d-8739-4b4f-8430-739ac542aac1",
            "hash": "af7873ff9eefea4f4968ca336961751a967138c3",
            "author_email": "github4merico+mericoqa1@s.gonze.com",
            "author_name": "Merico QA1",
            "author_timestamp": new Date('2021-01-07T23:22:03.000Z'),
            "committer_email": "noreply@github.com",
            "committer_name": "GitHub",
            "commit_timestamp": new Date('2021-01-07T23:22:03.000Z'),
            "parent_hashes_str": "587b44f053b64eb76379850e973437d3377805b3",
            "title": "Create LICENSE",
            "message": "Create LICENSE",
            "add_line": 79,
            "delete_line": 0,
            "report_id": 'b6335265-be8d-4e35-b7e5-b8d64bffe5bf',
            "dev_value": 0,
            "dev_equivalent": 0,
            "effective_add_line": 0,
            "effective_delete_line": 0,
            "cyclomatic_total": 73,
            "big_cyclomatic_function_number": 0,
            "in_default_ref": false,
            "abs_dev_value": 0,
            "abs_dev_value_add_line_ratio": 0,
            "num_functions": 0
          },
          {
            "project_id": "a1eb4c6d-8739-4b4f-8430-739ac542aac1",
            "hash": "587b44f053b64eb76379850e973437d3377805b3",
            "author_email": "github4merico+mericoqa1@s.gonze.com",
            "author_name": "Merico QA1",
            "author_timestamp": new Date('2021-01-07T23:19:58.000Z'),
            "committer_email": "noreply@github.com",
            "committer_name": "GitHub",
            "commit_timestamp": new Date('2021-01-07T23:19:58.000Z'),
            "parent_hashes_str": "",
            "title": "Add files via upload",
            "message": "Add files via upload",
            "add_line": 710,
            "delete_line": 0,
            "report_id": 'b6335265-be8d-4e35-b7e5-b8d64bffe5bf',
            "dev_value": 100,
            "dev_equivalent": 1489,
            "effective_add_line": 0,
            "effective_delete_line": 0,
            "cyclomatic_total": 73,
            "big_cyclomatic_function_number": 0,
            "in_default_ref": false,
            "abs_dev_value": 1489,
            "abs_dev_value_add_line_ratio": 2.0971830985915494,
            "num_functions": 41
          }
        ]
      })
    })

    it ('searches commits by hash value', async () => {
      const commitHash = '98e668f09fb89a9f17d9fc14d44ba5fd0f3f44ed'

      const req = mockRequest({
        user,
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-02-13T14:08:35.408-08:00',
          gitUrl: 'git://github.com/mericoqa1/test-of-time-meets-threshold.git',
          range: 'all',
          search: commitHash
        }
      })
      const res = mockResponse()

      await ImpactController.impactCommits(req, res)

      const returnVal = res.send.args[0][0]

      expect(res.status).to.have.been.calledWith(200)
      expect(returnVal.totalRecords).to.equal('1')
      expect(returnVal.data[0].hash).to.equal(commitHash)
    })
  })
})
