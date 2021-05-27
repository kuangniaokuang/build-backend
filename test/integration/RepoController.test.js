const sinon = require('sinon')
const chai = require('chai')
const {
  expect
} = chai
const sinonChai = require('sinon-chai')
const {
  mockRequest,
  mockResponse
} = require('mock-req-res')

const github = require('../../api/util/github')
const gitlab = require('../../api/util/gitlab')
const mockObjects = require('../util/mockObjects')
const RepoController = require('../../api/controllers/RepoController')
const Factory = require('../factory')

chai.use(sinonChai)

describe('RepoController', () => {
  let user

  beforeEach(async () => {
    user = await Factory.createUser()
    sinon.stub(github, 'getProjectListFromGithub').resolves(mockObjects.github.repos())
    sinon.stub(github, 'listGithubSharedRepos').resolves(mockObjects.github.sharedRepos())
    sinon.stub(gitlab, 'getProjectListFromGitlab').resolves(mockObjects.gitlab.repos())
  })

  afterEach(async () => {
    sinon.restore()
    user = null
    await Factory.destroyAll()
  })

  describe ('listGithub', function () {
    it('returns formatted github repos with totalRecords', async () => {
      await Factory.createProject(user.id, {
        url: 'https://api.github.com/repos/joncodo/zshrc',
        gitUrl: 'git://github.com/joncodo/zshrc.git',
        name: 'joncodo/zshrc',
        eeProjectId: 'c1fcc0e6-8248-42bf-93e2-d4063bca70a1'
      })

      const req = mockRequest({user})
      const res = mockResponse()

      await RepoController.listGithub(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        data: [
          {
            url: 'https://api.github.com/repos/joncodo/zshrc',
            name: 'joncodo/zshrc',
            gitUrl: 'git://github.com/joncodo/zshrc.git',
            lastUpdated: '2014-01-13T23:53:43Z',
            language: undefined,
            alreadyAdded: true
          },
          {
            url: 'https://api.github.com/repos/bill/foo',
            name: 'bill/foo',
            gitUrl: 'git://github.com/bill/foo.git',
            lastUpdated: '2014-01-13T23:53:43Z',
            language: 'JavaScript',
            alreadyAdded: false
          }
        ],
        totalRecords: 2
      })
    })
  })

  describe ('listGitlab', () => {
    it('returns formatted gitlab repos with totalRecords', async () => {
      const req = mockRequest({user})
      const res = mockResponse()

      await RepoController.listGitlab(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send).to.have.been.calledWith({
        data: [
          {
            url: 'https://gitlab.com/joncodo-merico/emptyrepo',
            name: 'EmptyRepo',
            gitUrl: 'https://gitlab.com/joncodo-merico/emptyrepo.git',
            lastUpdated: '2020-11-04T13:07:45.706Z',
            language: '',
            alreadyAdded: false
          },
          {
            url: 'https://gitlab.com/joncodo-merico/Test-repo-merico',
            name: 'Test Repo Merico',
            gitUrl: 'https://gitlab.com/joncodo-merico/Test-repo-merico.git',
            lastUpdated: '2020-11-04T13:10:33.973Z',
            language: '',
            alreadyAdded: false
          }
        ],
        totalRecords: 2
      })
    })
  })
})
