const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')
const chaiSubset = require('chai-subset');
const { mockRequest, mockResponse } = require('mock-req-res')

const MyProjectsController = require('../../api/controllers/MyProjectsController')
const { formatDate } = require('../util/helpers')
const { User, UserEmail } = require('../../db/models')
const myProjects = require('../../api/util/myProjects')
const Factory = require('../factory')

chai.use(sinonChai)
chai.use(chaiSubset);

describe ('MyProjectsController', () => {
  let user

  before(async () => {
    const userId = 4

    user = await User.findByPk(userId, {
      include: UserEmail
    })

    user = user.dataValues
    user.emails = user.UserEmails.map(userEmail => userEmail.get('email'))
  })

  afterEach(() => {
    sinon.restore()
  })

  after(async () => {
    await Factory.destroyAll()
  })

  describe ('my-projects', () => {
    it ('Gets several different metrics', async () => {
      const req = mockRequest({
        user: {
          id: 6
        },
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-04-30T14:08:35.408-08:00',
          gitUrls: [
            'https://gitlab.com/Flockademic/whereisscihub.git'
          ]
        }
      })
      const res = mockResponse()

      await MyProjectsController.getAll(req, res)

      const data = res.send.args[0][0][0]

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
      expect(data.quality).to.deep.equal({
        docCoverage: 8.33,
        codeReusability: 100,
        modularity: 0,
        staticTestCoverage: 0,
        overall: 27.08
      })
    })

    it ('handles an error and returns a 500', async () => {
      const req = mockRequest()
      const res = mockResponse()

      await MyProjectsController.getAll(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0]).to.include('No gitUrls provided')
    })

    it ('returns an error object instead of a project if a project is not found for a given gitUrl', async () => {
      const req = mockRequest({
        user,
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-02-13T14:08:35.408-08:00',
          gitUrls: [
            'git://github.com/not-a-user/not-a-project.git'
          ]
        }
      })
      const res = mockResponse()

      await MyProjectsController.getAll(req, res)

      expect(res.send.args[0][0]).to.deep.equal([{
        meta: {
          gitUrl: 'git://github.com/not-a-user/not-a-project.git'
        },
        error: 'Could not find a project with that gitUrl'
      }])
    })

    it ('returns an error object instead of a project if no analysis data is found for a given gitUrl', async () => {
      const project = await Factory.createProject(user.id)
      const req = mockRequest({
        user,
        query: {
          gitUrls: [
            project.get('gitUrl'),
          ]
        }
      })
      const res = mockResponse()

      await MyProjectsController.getAll(req, res)

      expect(res.send.args[0][0]).to.deep.equal([{
        meta: {
          gitUrl: project.get('gitUrl'),
          repoName: project.get('name')
        },
        error: 'Could not find analysis data for that gitUrl'
      }])
    })

    it ('returns an error object instead of a project data if the gitUrl does not belong to the user', async () => {
      const project = await Factory.createProject(user.id)
      const req = mockRequest({
        user: {
          id: 1
        },
        query: {
          startDate: '1921-02-11T14:08:35.408-08:00',
          endDate: '2021-03-30T14:08:35.408-08:00',
          gitUrls: [
            'git://github.com/basicthinker/Sestet.git'
          ]
        }
      })
      const res = mockResponse()

      await MyProjectsController.getAll(req, res)

      expect(res.send.args[0][0]).to.deep.equal([{
        meta: {
          gitUrl: 'git://github.com/basicthinker/Sestet.git',
          userId: 1
        },
        error: 'Project does not belong to user'
      }])
    })

    it ('returns no quality data for project if it does not find a report within the given date range', async () => {
      const req = mockRequest({
        user,
        query: {
          gitUrls: [
            'git://github.com/basicthinker/Sestet.git',
            'git://github.com/mericoqa1/test-minesweeper-multi-emails.git'
          ],
          startDate: '2013-01-01 08:00:00.505205-08',
          endDate: '2021-02-24 11:47:41.505205-08'
        }
      })
      const res = mockResponse()

      await MyProjectsController.getAll(req, res)

      expect(res.send.args[0][0][0].quality).to.deep.equal({
        error: 'No report found within date range',
        meta: {
          gitUrl: 'git://github.com/basicthinker/Sestet.git',
          startDate: '2013-01-01 08:00:00.505205-08',
          endDate: '2021-02-24 11:47:41.505205-08'
        }
      })

      expect(res.send.args[0][0][1].quality).to.deep.equal({
        docCoverage: 0.00,
        codeReusability: 0.00,
        modularity: 0.00,
        staticTestCoverage: 0.00,
        overall: 0.00
      })
    })
  })
})
