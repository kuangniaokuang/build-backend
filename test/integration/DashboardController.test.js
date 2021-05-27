const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')
const { mockRequest, mockResponse } = require('mock-req-res')
const chaiSubset = require('chai-subset');

const { User, UserEmail } = require('../../db/models')
const DashboardController = require('../../api/controllers/DashboardController')
const projectUtil = require('../../api/util/project')
const { formatDate } = require('../util/helpers')
chai.use(sinonChai)
chai.use(chaiSubset);

describe ('DashboardController', () => {
  let user

  before(async () => {
    const userId = 2

    user = await User.findByPk(userId, {
      include: UserEmail
    })

    user = user.dataValues
    user.emails = user.UserEmails.map(userEmail => userEmail.get('email'))
  })

  afterEach(() => {
    sinon.restore()
  })

  describe ('topContributions', () => {
    it('returns top contributions', async () => {
      const req = mockRequest({ user })
      const res = mockResponse()

      await DashboardController.topContributions(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith(sinon.match.has('rowCount', 3))
      expect(res.send).to.have.been.calledWith(sinon.match.has('data', [
        {
          dev_value: 1.0000000149011612,
          id: 'a528a108-32bc-43e4-be86-223a69bac6c3',
          project_name: 'test-of-time-meets-threshold'
        },
        {
          dev_value: 1,
          id: 'a1eb4c6d-8739-4b4f-8430-739ac542aac1',
          project_name: '710-loc-python'
        },
        {
          dev_value: 0.9999999701976776,
          id: 'ad99d928-5a14-4858-92e4-b53ce50c4444',
          project_name: 'minesweeper-meets-eloc-threshold'
        }
      ]))
    })
  })

  describe('topAchievements', () => {
    it ('returns top achievements', async () => {
      const req = mockRequest({ user })
      const res = mockResponse()

      await DashboardController.topAchievements(req, res)

      expect(res.status).to.have.been.calledWith(200)

      const data = res.send.args[0][0].data
      expect(data).to.have.length(1)

      const badge = data[0]
      expect(badge.name).to.equal('Linguist for Python')
      expect(badge.grade).to.equal('GOLD')
    })
  })

  describe('devValueByTeam', () => {
    it('returns top devValueByTeam', async () => {
      const req = mockRequest({
        user,
        query: {
          startDate: '2021-01-23T11:49:15.738-08:00',
          endDate: '2021-02-25T11:49:15.738-08:00',
          repositories: [
            'git://github.com/mericoqa1/710-loc-python.git',
            'git://github.com/mericoqa1/test-of-time-meets-threshold.git',
            'git://github.com/mericoqa1/minesweeper-meets-eloc-threshold.git',
            'git://github.com/mericoqa1/test-minesweeper-multi-emails.git'
          ],
          range: 'month'
        }
      })
      const res = mockResponse()

      await DashboardController.devValueByTeam(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        data: [
          {
            repository: { name: 'test-of-time-meets-threshold' },
            dataSet: [
              {
                date: "2021-02-23",
                project_name: "test-of-time-meets-threshold",
                git_url: "git://github.com/mericoqa1/test-of-time-meets-threshold.git",
                dev_value: 0.4459454417228699,
                count: "1",
                loc: 68,
                eloc: 68
              }
            ]
          }
        ]
      })
    })

    describe('devValueByRanking', () => {
      it('returns top devValueByRanking', async () => {
        const req = mockRequest({
          user,
          query: {
            startDate: '2021-01-11T13:20:18.497-08:00',
            endDate: '2021-02-13T13:20:18.497-08:00',
            repositories: [
              'git://github.com/mericoqa1/710-loc-python.git',
              'git://github.com/mericoqa1/test-of-time-meets-threshold.git',
              'git://github.com/mericoqa1/minesweeper-meets-eloc-threshold.git',
              'git://github.com/mericoqa1/test-minesweeper-multi-emails.git'
            ],
            range: 'month'
          }
        })
        const res = mockResponse()

        await DashboardController.devValueByRanking(req, res)

        expect(res.status).to.have.been.calledWith(200)
        expect(res.send.args[0][0].data).to.containSubset([
          {
            gitUrl: 'git://github.com/mericoqa1/710-loc-python.git',
            name: '710-loc-python',
            position: 0,
            contributors: 1
          },
          {
            gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
            name: 'test-minesweeper-multi-emails',
            position: 0,
            contributors: 5
          },
          {
            gitUrl: 'git://github.com/mericoqa1/minesweeper-meets-eloc-threshold.git',
            name: 'minesweeper-meets-eloc-threshold',
            position: 0,
            contributors: 1
          },
          {
            gitUrl: 'git://github.com/mericoqa1/test-of-time-meets-threshold.git',
            name: 'test-of-time-meets-threshold',
            position: 1,
            contributors: 1
          }
        ])
      })
    })
  })

  describe('overview', () => {
    it ('returns an overview', async () => {
      const req = mockRequest({
        user: {
          id: 6
        },
        query: {
          startDate: '2010-01-11T13:20:18.497-08:00',
          endDate: '2021-02-13T13:20:18.497-08:00',
          gitUrl: 'https://gitlab.com/Flockademic/whereisscihub.git'
        }
      })
      const res = mockResponse()

      await DashboardController.overview(req, res)

      expect(res.status).to.have.been.calledWith(200)

      const data = res.send.args[0][0].data
      expect(data.gitUrl).to.equal('https://gitlab.com/Flockademic/whereisscihub.git')
      expect(data.url).to.equal('https://github.com/Flockademic/whereisscihub')
      expect(data.repoName).to.equal('whereisscihub')
      expect(data.interval).to.equal('year')
      expect(data.velocity).to.deep.equal([
        { date: formatDate('2012-01-01T12:00:00.000Z'), elocs: 0 },
        { date: formatDate('2013-01-01T12:00:00.000Z'), elocs: 4 },
        { date: formatDate('2014-01-01T12:00:00.000Z'), elocs: 28 },
        { date: formatDate('2015-01-01T12:00:00.000Z'), elocs: 23 },
        { date: formatDate('2016-01-01T12:00:00.000Z'), elocs: 0 },
        { date: formatDate('2017-01-01T12:00:00.000Z'), elocs: 123 },
        { date: formatDate('2018-01-01T12:00:00.000Z'), elocs: 410 },
        { date: formatDate('2019-01-01T12:00:00.000Z'), elocs: 115 }
      ])
      expect(data.population).to.deep.equal([
        { date: formatDate('2012-01-01T12:00:00.000Z'), contributors: '1' },
        { date: formatDate('2013-01-01T12:00:00.000Z'), contributors: '3' },
        { date: formatDate('2014-01-01T12:00:00.000Z'), contributors: '6' },
        { date: formatDate('2015-01-01T12:00:00.000Z'), contributors: '6' },
        { date: formatDate('2016-01-01T12:00:00.000Z'), contributors: '2' },
        { date: formatDate('2017-01-01T12:00:00.000Z'), contributors: '5' },
        { date: formatDate('2018-01-01T12:00:00.000Z'), contributors: '2' },
        { date: formatDate('2019-01-01T12:00:00.000Z'), contributors: '1' }
      ])
      expect(data.merges).to.deep.equal([
        { date: formatDate('2018-01-01T12:00:00.000Z'), merged: 3, opened: 0 }
      ])
      expect(data.ranking[0]).to.deep.equal({
        displayName: 'Merico Qa',
        emails: [ 'git@vincenttunru.com', 'projects@vinnl.nl' ],
        gitUsername: 'mericoqa1',
        photo: 'https://secure.gravatar.com/avatar/2547d4a41ed5ccd75231651011fcd501?s=80&d=identicon',
        productivity: 525,
        productivityRank: 1,
        merges: 3,
        impact: 73.59240800142288,
        impactRank: 1,
        mergeRank: 1,
        userId: 6
      })
      expect(data.ranking).to.have.length(16)
    })

    it('returns an error when it cannot find the project', async () => {
      const req = mockRequest({
        user: {
          id: 4
        },
        query: {
          gitUrl: 'git://github.com/fsfdsh/fdfsdfds'
        }
      })
      const res = mockResponse()

      await DashboardController.overview(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.send.args[0][0].error.message).to.equal('No project found for that gitUrl')
    })

    it('returns an error when the project does not belong to the user', async () => {
      const req = mockRequest({
        user: {
          id: 3
        },
        query: {
          gitUrl: 'git://github.com/basicthinker/Sestet.git'
        }
      })
      const res = mockResponse()

      await DashboardController.overview(req, res)

      expect(res.status).to.have.been.calledWith(403)
      expect(res.send.args[0][0].error.message).to.equal('Project does not belong to user')
    })

    it ('gracefully handles the case where there are no metrics', async () => {
      const req = mockRequest({
        user: {
          id: 4
        },
        query: {
          startDate: '2021-01-11T13:20:18.497-08:00',
          endDate: '2021-02-13T13:20:18.497-08:00',
          gitUrl: 'git://github.com/basicthinker/Sestet.git'
        }
      })
      const res = mockResponse()

      await DashboardController.overview(req, res)

      const data = res.send.args[0][0].data
      expect(data).to.deep.equal({
        gitUrl: 'git://github.com/basicthinker/Sestet.git',
        url: 'https://github.com/basicthinker/Sestet',
        repoName: 'Sestet',
        interval: 'week',
        ranking: [],
        velocity: [],
        population: [],
        merges: []
      })
    })

    it('returns a 500 error with a stack trace when something goes terribly wrong', async () => {
      sinon.stub(projectUtil, 'homogenizeGitUrl').throws('Something bad happened')
      const req = mockRequest({
        user: {
          id: 4
        },
        query: {
          startDate: '2021-01-11T13:20:18.497-08:00',
          endDate: '2021-02-13T13:20:18.497-08:00',
          gitUrl: 'git://github.com/basicthinker/Sestet.git'
        }
      })
      const res = mockResponse()

      await DashboardController.overview(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.message).to.equal('An unexpected error occurred in DashboardController.overview')
      expect(res.send.args[0][0].error.meta.stack).to.include('Something bad happened')
    })

    it ('returns only commit dates that we actually analyzed and not prior commits', async () => {
      const req = mockRequest({
        user: {
          id: 7 // Paul Goertzen
        },
        query: {
          startDate: '2010-01-11T13:20:18.497-08:00',
          endDate: '2021-02-13T13:20:18.497-08:00',
          gitUrl: 'https://gitlab.com/merico-dev/ce/ce-backend.git'
        }
      })
      const res = mockResponse()

      await DashboardController.overview(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0].data.velocity).to.deep.equal([
        { date: formatDate('2021-01-04T12:00:00.000Z'), elocs: 2657 },
        { date: formatDate('2021-01-11T12:00:00.000Z'), elocs: 7808 },
        { date: formatDate('2021-01-18T12:00:00.000Z'), elocs: 2179 },
        { date: formatDate('2021-01-25T12:00:00.000Z'), elocs: 3881 },
        { date: formatDate('2021-02-01T12:00:00.000Z'), elocs: 3992 },
        { date: formatDate('2021-02-08T12:00:00.000Z'), elocs: 1848 }
      ])
    })
  })
})
