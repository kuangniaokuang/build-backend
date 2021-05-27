const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
should = chai.should();
const sinonChai = require('sinon-chai')
const { mockRequest, mockResponse } = require('mock-req-res')
const chaiSubset = require('chai-subset');

const { User } = require('../../db/models')
const github = require('../../api/util/github')
const gitlab = require('../../api/util/gitlab')
const projectUtil = require('../../api/util/project')
const config = require('../../config/env/resolveConfig')
const ProjectController = require('../../api/controllers/ProjectController')
const aeHelper = require('../../api/util/aeHelper')
const Factory = require('../factory')
const helpers = require('../util/helpers')
const mockObjects = require('../util/mockObjects')
const { commits: githubCommits } = require('../util/githubApiResponse')
const { commits: gitlabCommits } = require('../util/gitlabApiResponse')
const { createProjectInEE } = require('../../api/util/project')
const { staging, production } = require('../../config/constants/environments')
const { formatFullProjectForApiResponse } = require('../../api/util/apiResponseFormatter')

chai.use(sinonChai)
chai.use(chaiSubset);

const originalNodeEnv = process.env.NODE_ENV

describe ('ProjectController', () => {
  let user

  beforeEach(async () => {
    user = await Factory.createUser()

    sinon.stub(aeHelper.helper, 'submitRepo').resolves(mockObjects.messages.submitRepoResponse)

    sinon.stub(github, 'getCommits').resolves(githubCommits)
    sinon.stub(gitlab, 'getCommits').resolves(gitlabCommits)

    sinon.stub(github, 'getProject').callsFake((gitUrl) => {
      return {
        gitUrl,
        url: 'test',
        name: 'test',
      }
    })

    sinon.stub(projectUtil, 'getCommitRangeForLimit').resolves({
      commitBefore: null,
      commitAfter: 0
    })
  })

  afterEach(async () => {
    sinon.restore()
    user = null
    await Factory.destroyAll()
  })

  describe('get projects', function () {
    it ('returns 404 if there are no project', async () => {
      const req = mockRequest({
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()
      await ProjectController.projects(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        data: [],
        totalRecords: 0,
      })
    })

    it ('returns a couple projects in order of creation by default', async () => {
      const req = mockRequest({
        user: {
          id: 1,
        },
        query: {
          count: 5
        }
      })
      const res = mockResponse()

      await ProjectController.projects(req, res)

      expect(res.status).to.have.been.calledWith(200)

      const response = res.send.args[0][0]

      expect(response.totalRecords).to.equal(7)
      expect(response.data).to.have.length(5)
      expect(response.data[0]).to.deep.equal({
        id: 3,
        url: 'https://github.com/mericogold/275-line-javascript-with-0-ELOC',
        gitUrl: 'git://github.com/mericogold/275-line-javascript-with-0-ELOC.git',
        name: '275-line-javascript-with-0-ELOC',
        nextProcessing: new Date('2021-02-11T23:59:19.998Z'),
        incomingReportId: null,
        latestReportId: '697e1658-86dd-4a91-bbd5-73263c0700bd',
        createdAt: new Date('2021-02-10T23:59:19.732Z'),
        updatedAt: new Date('2021-03-01T22:52:35.355Z'),
        isFavorite: false,
        lastSyncTime: null,
        projectId: 'ef85885c-3cc0-4622-968f-e90b4c0daacf',
        status: 'READY',
        errorMessage: null,
        commitTimestamp: new Date('2020-12-11T22:37:01.000Z'),
        commitTitle: 'Repro for https://gitlab.com/meri.co/community-edition/ce-all/-/issues/514',
        commitMessage: 'Repro for https://gitlab.com/meri.co/community-edition/ce-all/-/issues/514\n',
        latestCommitHash: 'eb7961c3cfa8cd866e31ec79919af7ec36854cd0',
        progress: null,
        userCommitCount: '0'
      })
    })
  })

  describe('create', () => {
    it ('should submit project for analysis and return a project object', async () => {
      projectUtil.getCommitRangeForLimit.restore()
      const projectRequest = mockObjects.requests.project.create()
      const req = mockRequest({
        body: projectRequest,
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.create(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(aeHelper.helper.submitRepo).to.have.been.calledOnce

      const now = Math.floor(Date.now() / 1000)

      expect(aeHelper.helper.submitRepo.args[0][0].commit_before).to.be.null
      expect(aeHelper.helper.submitRepo.args[0][0].commit_after).to.equal(1408401606)

      expect(res.send).to.have.been.calledWith(
        sinon.match({
          name: projectRequest.name,
        })
      )
    })

    it ('should return an error if it cannot create the project', async () => {
      sinon.stub(projectUtil, 'homogenizeWebUrl').throws('What a fail')
      const req = mockRequest({
        body: mockObjects.requests.project.create(),
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.create(req, res)
      expect(res.status).to.have.been.calledWith(500)
      expect(aeHelper.helper.submitRepo).to.have.not.been.called
      expect(res.send).to.have.been.calledWith(sinon.match.has('error', 'What a fail'))
    })

    it ('should allow two users to share the same project', async () => {
      // create a project with user1
      const projectRequest = mockObjects.requests.project.create()
      const req1 = mockRequest({
        body: projectRequest,
        user: {
          id: user.id,
        },
      })
      const res1 = mockResponse()

      await ProjectController.create(req1, res1)

      expect(res1.status).to.have.been.calledWith(200)
      expect(aeHelper.helper.submitRepo).to.have.been.calledOnce

      // create the same project with user2
      user2 = await Factory.createUser()

      const req2 = mockRequest({
        body: projectRequest,
        user: {
          id: user2.id,
        },
      })
      const res2 = mockResponse()

      await ProjectController.create(req2, res2)

      expect(res2.status).to.have.been.calledWith(200)
      expect(aeHelper.helper.submitRepo).to.have.been.calledTwice

      // ensure they both share the same id and eeProjectId
      expect(res2.send.args[0][0].id).to.equal(res1.send.args[0][0].id)
      expect(res2.send.args[0][0].eeProjectId).to.equal(res1.send.args[0][0].eeProjectId)
    })

    it ('converts the project gitUrl into the desired format', async () => {
      sinon.spy(projectUtil, 'homogenizeGitUrl')
      const projectRequest = mockObjects.requests.project.create()
      const expectedUrl = projectRequest.gitUrl

      projectRequest.gitUrl = projectRequest.gitUrl.replace('git://', 'http://')

      const req = mockRequest({
        body: projectRequest,
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.create(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(projectUtil.homogenizeGitUrl).to.have.been.calledOnce
      expect(res.send.args[0][0].gitUrl).to.equal(expectedUrl)
    })
  })

  describe('createMany', () => {
    it ('should submit projects for analysis and return many project objects', async () => {
      sinon.spy(projectUtil, 'homogenizeGitUrl')

      const req = mockRequest({
        body: {
          projects: [
            mockObjects.requests.project.createMany[0],
            {
              ...mockObjects.requests.project.createMany[1],
              // this gitUrl is purposefully different to test the homogenization of gitUrls
              gitUrl: 'https://github.com/mericoqa1/fake-repo9191.git'
            }
          ],
        },
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.createMany(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(aeHelper.helper.submitRepo).to.have.been.calledTwice
      expect(projectUtil.homogenizeGitUrl.callCount).to.equal(4)
      expect(res.send.args[0][0].successes).to.containSubset([
        {
          gitUrl: mockObjects.requests.project.createMany[0].gitUrl,
          name: mockObjects.requests.project.createMany[0].name
        },
        {
          gitUrl: 'git://github.com/mericoqa1/fake-repo9191.git',
          name: mockObjects.requests.project.createMany[1].name
        }
      ])
    })

    it('should return a failure message if we cannot access the repo', async () => {
      github.getProject.restore()
      sinon.stub(github, 'getProject').rejects('A fake error')

      const req = mockRequest({
        body: {
          projects: [
            {
              ...mockObjects.requests.project.createMany[1],
            },
          ],
        },
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.createMany(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        failures: [
          {
            message: 'Unable to access repository',
            code: 'REPO_ACCESS',
            project: req.body.projects[0],
          }
        ],
        successes: [],
        warnings: [],
      })
    })

    it ('should return a 200 with empty arrays if nothing gets added', async () => {
      const req = mockRequest({
        body: {
          projects: []
        },
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.createMany(req, res)
      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        failures: [],
        successes: [],
        warnings: [],
      })
    })

    it ('should tell me if my project has been commit limited', async () => {
      projectUtil.getCommitRangeForLimit.restore()
      sinon.stub(projectUtil, 'getCommitRangeForLimit').resolves({
        commitBefore: 16434328927,
        commitAfter: 15438549857
      })

      github.getProject.restore()
      sinon.stub(github, 'getProject').resolves({ size: 99999999999 })

      const req = mockRequest({
        body: {
          projects: [mockObjects.requests.project.createMany[0]]
        },
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.createMany(req, res)
      const data = res.send.args[0][0]

      expect(data.successes).to.have.length(1)
      expect(data.failures).to.have.length(0)
      expect(data.warnings).to.have.length(1)
      expect(data.warnings[0].message).to.equal('Repo is large and may take a while to analyze. Due to the large size of this repository, we can only process the most recent 2500 commits.')
    })
  })

  describe('delete a single project', function () {
    it ('should delete a single project', async () => {
      const projectRequest = mockObjects.requests.project.create()
      const createReq = mockRequest({
        body: projectRequest,
        user: {
          id: user.id,
        },
      })
      const createRes = mockResponse()

      await ProjectController.create(createReq, createRes)

      const ceProjectsBeforeDelete = await helpers.findAndCountProjectsInCE(user.id)
      expect(ceProjectsBeforeDelete.count).to.equal(1)

      const deleteReq = mockRequest({
        body: {
          gitUrl: projectRequest.gitUrl,
        },
        user: {
          id: user.id,
        },
      })
      const deleteRes = mockResponse()

      // call the api
      await ProjectController.delete(deleteReq, deleteRes)

      // check the api called the function correctly
      expect(deleteRes.status).to.have.been.calledWith(200)
      const project = ceProjectsBeforeDelete.rows[0]

      expect(deleteRes.send).to.have.been.calledWith({ data: formatFullProjectForApiResponse(project) })

      // ensure the user is no longer associated with the project
      const ceProjectsAfterDelete = await helpers.findAndCountProjectsInCE(user.id)
      expect(ceProjectsAfterDelete.count).to.equal(0)

      // ensure the project still exists in the db
      const remainingProject = await helpers.getProject(project.get('id'))
      expect(remainingProject.get('gitUrl')).to.equal(project.get('gitUrl'))
    })
  })

  describe('delete projects', function () {
    it ('should delete all the projects', async () => {
      // create two projects
      const createReq = mockRequest({
        body: {
          projects: mockObjects.requests.project.createMany,
        },
        user: {
          id: user.id,
        },
      })
      const createRes = mockResponse()

      await ProjectController.createMany(createReq, createRes)

      const ceProjectsBeforeDelete = await helpers.findAndCountProjectsInCE(user.id)
      expect(ceProjectsBeforeDelete.count).to.equal(2)

      const deleteReq = mockRequest({
        body: {
          gitUrls: [
            mockObjects.db.project.createMany[0].gitUrl,
            mockObjects.db.project.createMany[1].gitUrl,
          ]
        },
        user: {
          id: user.id,
        },
      })
      const deleteRes = mockResponse()

      // call the api
      await ProjectController.deleteMany(deleteReq, deleteRes)

      // check the api called the function correctly
      expect(deleteRes.status).to.have.been.calledWith(200)
      expect(deleteRes.send).to.have.been.calledWith('All selected repos were deleted')

      const ceProjectsAfterDelete = await helpers.findAndCountProjectsInCE(user.id)
      expect(ceProjectsAfterDelete.count).to.equal(0)
    })
  })

  describe ('setFavouriteRepos', () => {
    it ('returns 400 if you do not pass projects in the body', async () => {
      const req = mockRequest({
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.setFavoriteRepos(req, res)

      expect(res.status).to.have.been.calledWith(400)
      expect(res.send).to.have.been.calledWith('You must pass projects in the body [{id: 1, isFavorite:true}]')
    })

    it ('returns 200 and sets projects as favourites', async () => {
      const project1 = await Factory.createProject(user.id)
      const project2 = await Factory.createProject(user.id)

      const req = mockRequest({
        body: {
          projects: [
            {
              gitUrl: project1.gitUrl,
              isFavorite: true,
            },
            {
              gitUrl: project2.gitUrl,
              isFavorite: false
            },
            {
              gitUrl: 'not-a-url',
              isFavorite: true,
            }
          ]
        },
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.setFavoriteRepos(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        successes: sinon.match.array.deepEquals([project1.gitUrl, project2.gitUrl]),
        fails: sinon.match.array.deepEquals(['not-a-url'])
      })

      await project1.reload({ include: User })
      await project2.reload({ include: User })

      expect(project1.get('Users')[0].get('UserProject').get('isFavorite')).to.be.true
      expect(project2.get('Users')[0].get('UserProject').get('isFavorite')).to.be.false
    })
  })

  describe ('submitting merico private repos', () => {
    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    })

    it ('should submit merico repos for analysis with ssh', async () => {
      process.env.NODE_ENV = staging

      let projectRequest = mockObjects.requests.project.create()
      projectRequest.gitUrl = `https://gitlab.com/merico-dev/fake-repo-48376.git`

      const req = mockRequest({
        body: projectRequest,
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.create(req, res)

      const submitRepoRequest = aeHelper.helper.submitRepo.args[0][0]

      expect(submitRepoRequest.git_url).to.equal('git@gitlab.com:merico-dev/fake-repo-48376.git')
      expect(submitRepoRequest.private_key).to.not.be.null
      expect(submitRepoRequest.auth_type).to.equal(1)
    })

    it ('should not submit merico repos for analysis with ssh in production', async () => {
      process.env.NODE_ENV = production

      let projectRequest = mockObjects.requests.project.create()
      projectRequest.gitUrl = `https://gitlab.com/merico-dev/fake-repo-48376.git`

      const req = mockRequest({
        body: projectRequest,
        user: {
          id: user.id,
        },
      })
      const res = mockResponse()

      await ProjectController.create(req, res)

      const submitRepoRequest = aeHelper.helper.submitRepo.args[0][0]

      expect(submitRepoRequest.git_url).to.equal('https://gitlab.com/merico-dev/fake-repo-48376.git')
      expect(submitRepoRequest.private_key).to.be.undefined
      expect(submitRepoRequest.auth_type).to.equal(0)
    })
  })

  describe('publicProfile', () => {
    it ('gets the profile data', async () => {
      const req = mockRequest({
        query: {
          gitUrl: 'git://gitlab.com/Flockademic/whereisscihub.git',
          startDate: '1922-01-01 12:00:00.000Z',
          endDate: '2021-04-14 12:00:00.000Z',
        }
      })
      const res = mockResponse()

      await ProjectController.publicProfile(req, res)

      expect(res.status).to.have.been.calledWith(200)

      const data = res.send.args[0][0].data

      expect(data.gitUrl).to.equal('https://gitlab.com/Flockademic/whereisscihub.git')
      expect(data.name).to.equal('whereisscihub')
      expect(data.webUrl).to.equal('https://github.com/Flockademic/whereisscihub')
      expect(data.interval).to.equal('year')
      expect(data.topContributors).to.have.length(16)
      expect(data.population).to.deep.equal([
        { date: helpers.formatDate('2012-01-01T12:00:00.000Z'), contributors: '1' },
        { date: helpers.formatDate('2013-01-01T12:00:00.000Z'), contributors: '3' },
        { date: helpers.formatDate('2014-01-01T12:00:00.000Z'), contributors: '6' },
        { date: helpers.formatDate('2015-01-01T12:00:00.000Z'), contributors: '6' },
        { date: helpers.formatDate('2016-01-01T12:00:00.000Z'), contributors: '2' },
        { date: helpers.formatDate('2017-01-01T12:00:00.000Z'), contributors: '5' },
        { date: helpers.formatDate('2018-01-01T12:00:00.000Z'), contributors: '2' },
        { date: helpers.formatDate('2019-01-01T12:00:00.000Z'), contributors: '1' }
      ])
      expect(data.velocity).to.deep.equal([
        { date: helpers.formatDate('2012-01-01T12:00:00.000Z'), elocs: 0 },
        { date: helpers.formatDate('2013-01-01T12:00:00.000Z'), elocs: 4 },
        { date: helpers.formatDate('2014-01-01T12:00:00.000Z'), elocs: 28 },
        { date: helpers.formatDate('2015-01-01T12:00:00.000Z'), elocs: 23 },
        { date: helpers.formatDate('2016-01-01T12:00:00.000Z'), elocs: 0 },
        { date: helpers.formatDate('2017-01-01T12:00:00.000Z'), elocs: 123 },
        { date: helpers.formatDate('2018-01-01T12:00:00.000Z'), elocs: 410 },
        { date: helpers.formatDate('2019-01-01T12:00:00.000Z'), elocs: 115 }
      ])
      expect(data.merges).to.deep.equal([
        { date: helpers.formatDate('2018-01-01T12:00:00.000Z'), merged: 3, opened: 0 }
      ])
    })

    it ('returns 500 if something goes wrong', async () => {
      sinon.stub(projectUtil, 'getOneByGitUrl').throws('No project found')
      const req = mockRequest({
        query: {
          gitUrl: 'git://gitlab.com/Flockademic/whereisscihub.git',
        }
      })
      const res = mockResponse()

      await ProjectController.publicProfile(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.meta.stack).to.include('No project found')
      sinon.restore()
    })

    it ('returns a 404 if no project found', async () => {
      const req = mockRequest({
        query: {
          gitUrl: 'git://gitlab.com/unfound/giturl.git',
        }
      })
      const res = mockResponse()

      await ProjectController.publicProfile(req, res)

      expect(res.status).to.have.been.calledWith(404)
      expect(res.send.args[0][0].error.message).to.include('No project found for that gitUrl')
    })
  })

  describe ('updateWarningsWithAnalysis', () => {
    it ('adds to existing warning', () => {
      const projectsAdded = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails'
      }]

      const createWarnings = [{
        message: 'Not the worst but not the best',
        code: 'NOT_THE_BEST',
        project: projectsAdded[0]
      }]

      const analyses = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails',
        options: {
          commitLimit: 2500,
          commitBefore: 16543857348,
          commitAfter: 15343534857
        }
      }]

      const warnings = ProjectController.updateWarningsWithAnalysis(projectsAdded, createWarnings, analyses)

      expect(warnings[0].message).to.equal('Not the worst but not the best. Due to the large size of this repository, we can only process the most recent 2500 commits.')
      expect(warnings).to.have.length(1)
    })

    it ('creates a new warning', () => {
      const projectsAdded = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails'
      }]

      const createWarnings = []

      const analyses = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails',
        options: {
          commitLimit: 2500,
          commitBefore: 16543857348,
          commitAfter: 15343534857
        }
      }]

      const warnings = ProjectController.updateWarningsWithAnalysis(projectsAdded, createWarnings, analyses)

      expect(warnings[0].message).to.equal('Due to the large size of this repository, we can only process the most recent 2500 commits.')
      expect(warnings).to.have.length(1)
    })

    it ('Leaves a warning alone if there is no analysis warning', () => {
      const projectsAdded = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails'
      }]

      const createWarnings = [{
        message: 'Not the worst but not the best',
        code: 'NOT_THE_BEST',
        project: projectsAdded[0]
      }]

      const analyses = []

      const warnings = ProjectController.updateWarningsWithAnalysis(projectsAdded, createWarnings, analyses)

      expect(warnings[0].message).to.equal('Not the worst but not the best')
      expect(warnings).to.have.length(1)
    })

    it ('Does nothing when the analysis does not warrant a warning', () => {
      const projectsAdded = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails'
      }]

      const createWarnings = []

      const analyses = [{
        gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        name: 'test-minesweeper-multi-emails',
        options: {
          commitLimit: 2500,
          commitBefore: 16543857348,
          commitAfter: 0
        }
      }]

      const warnings = ProjectController.updateWarningsWithAnalysis(projectsAdded, createWarnings, analyses)

      expect(warnings).to.have.length(0)
    })
  })

  describe ('devMetricsForProject', () => {
    it ('returns metrics', async () => {
      const req = mockRequest({
        query: {
          startDate: '2020-12-10T14:50:25.788Z',
          endDate: '2020-12-20T14:50:25.788Z',
          gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        },
        user: {
          id: 4,
        },
      })
      const res = mockResponse()

      await ProjectController.allDevMetricsForProject(req, res)
      const { data } = res.send.args[0][0]

      expect(data).to.containSubset([
        {
          displayName: "Dev A",
          emails: ["a1@merico.dev", "a2@merico.dev"],
          gitUsername: "mericoqa2",
          impact: 11.764706298708916,
          impactRank: 2,
          photo: "https://avatars.githubusercontent.com/u/75958071?v=4",
          productivity: 6,
          productivityRank: 2,
          userId: 4
        },
        {
          displayName: "Dev A",
          emails: ["a3@merico.dev"],
          gitUsername: "",
          impact: 3.9215687662363052,
          impactRank: 3,
          photo: "",
          productivity: 2,
          productivityRank: 3,
          userId: null
        },
        {
          displayName: "Dev B",
          emails: ["b@merico.dev"],
          gitUsername: "",
          impact: 3.9215687662363052,
          impactRank: 3,
          photo: "",
          productivity: 2,
          productivityRank: 3,
          userId: null
        },
        {
          displayName: "Mine Producer",
          emails: ["mine.producer@merico.dev"],
          gitUsername: "",
          impact: 80.39215803146362,
          impactRank: 1,
          photo: "",
          productivity: 41,
          productivityRank: 1,
          userId: null
        }
      ])
    })

    it ('returns merge metrics', async () => {
      const req = mockRequest({
        query: {
          startDate: '2000-12-10T14:50:25.788Z',
          endDate: '2021-12-20T14:50:25.788Z',
          gitUrl: 'https://gitlab.com/Flockademic/whereisscihub.git',
        },
        user: {
          id: 6,
        },
      })
      const res = mockResponse()

      await ProjectController.allDevMetricsForProject(req, res)
      const { data } = res.send.args[0][0]

      expect(data).to.containSubset([
        {
          displayName: "Merico Qa",
          emails: ["git@vincenttunru.com", "projects@vinnl.nl"],
          mergeRank: 1
        },
      ])
    })

    it ('returns a 404 if the project does not exist', async () => {
      const req = mockRequest({
        query: {
          startDate: '2020-12-10T14:50:25.788Z',
          endDate: '2020-12-20T14:50:25.788Z',
          gitUrl: 'git://github.com/mfksjhfdsjk/fdsjkfhdskj.git',
        },
        user: {
          id: 4,
        },
      })
      const res = mockResponse()

      await ProjectController.allDevMetricsForProject(req, res)
      expect(res.status).to.have.been.calledWith(404)
    })

    it ('returns 401 if the user does not own the project', async () => {
      const req = mockRequest({
        query: {
          startDate: '2020-12-10T14:50:25.788Z',
          endDate: '2020-12-20T14:50:25.788Z',
          gitUrl: 'git://github.com/mericoqa1/test-minesweeper-multi-emails.git',
        },
        user: {
          id: 1,
        },
      })
      const res = mockResponse()

      await ProjectController.allDevMetricsForProject(req, res)
      expect(res.status).to.have.been.calledWith(401)
    })

    it ('returns 500 if we have an unexpected error', async () => {
      const req = mockRequest()
      const res = mockResponse()

      await ProjectController.allDevMetricsForProject(req, res)

      expect(res.status).to.have.been.calledWith(500)
    })
  })
})


