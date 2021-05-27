const sinon = require('sinon')
const chai = require("chai");
const { expect } = chai
const sinonChai = require("sinon-chai");
const {
  mockRequest,
  mockResponse
} = require('mock-req-res')

const githubUtil = require('../../api/util/github')
const gitlabUtil = require('../../api/util/gitlab')
const projectUtil = require('../../api/util/project')
const PublicProfileController = require('../../api/controllers/PublicProfileController')
const Factory = require('../factory')

chai.use(sinonChai);

describe ('PublicProfileController', () => {
  beforeEach(async () => {
    sinon.stub(githubUtil, 'getEmails').returns([{email: 'jon@foo.com'}])
  });

  afterEach(async () => {
    try {
      sinon.restore();
      await Factory.destroyAll()
    } catch (error) {
      console.error('ERROR: PublicProfileController.test.js afterEach ', error)
    }
  })

  describe('GET /publicProfile/:id', () => {
    it('should return 404 for a not found user', async () => {
      const req = mockRequest()
      req.params.id = 999999
      const res = mockResponse()

      try {
        await PublicProfileController.getUserProfile(req, res)
      } catch (error) {
        console.error(error)
      }

      expect(res.status(404).send).to.have.been.calledWith('User Not Found')
    });
  });

  describe ('public project profile search', () => {
    it ('finds a project for a gitUrl and returns search data', async () => {
      const req = mockRequest({
        query: {
          gitUrl: 'git://giThub.com/BasicThinker/Sestet.git'
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(200)

      const data = res.send.args[0][0].data

      expect(data).to.deep.equal({
        gitUrl: 'git://github.com/basicthinker/Sestet.git',
        name: 'Sestet',
        repositoryUrl: 'https://github.com/basicthinker/Sestet',
        publicProfileUrl: `projects/repository/overview?gitUrl=git://github.com/basicthinker/Sestet.git`
      })
    })

    it ('returns 400 if not a valid giturl', async () => {
      const req = mockRequest({
        query: {
          gitUrl: 'github.com/BasicThinker/Sestet'
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(400)

      const req2 = mockRequest({
        query: {
          gitUrl: 'gitUrl=git://github.com/e2corporation/java-analysis-tester.git'
        }
      })
      const res2 = mockResponse()

      await PublicProfileController.publicProfileSearch(req2, res2)

      expect(res2.status).to.have.been.calledWith(400)

      const req3 = mockRequest({
        query: {
          gitUrl: 'git://github.com/e2corporation/java-analysis-tester'
        }
      })
      const res3 = mockResponse()

      await PublicProfileController.publicProfileSearch(req3, res3)

      expect(res3.status).to.have.been.calledWith(400)
    })

    it ('returns 200 if it does not find a project and the repository exists (github)', async () => {
      sinon.stub(githubUtil, 'authenticatedGithubApiRequest').resolves({
        name: 'kubernetes',
        html_url: 'https://github.com/kubernetes/kubernetes',
        git_url: 'git://github.com/kubernetes/kubernetes.git'
      })

      const req = mockRequest({
        query: {
          gitUrl: 'git://github.com/kubernetes/kubernetes.git'
        },
        user: {
          id: 5
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0].data).to.deep.equal({
        gitUrl: 'git://github.com/kubernetes/kubernetes.git',
        name: 'kubernetes',
        repositoryUrl: 'https://github.com/kubernetes/kubernetes',
        publicProfileUrl: null
      })

      githubUtil.authenticatedGithubApiRequest.restore()
    })

    it ('returns 200 if it does not find a project and the repository exists (gitlab)', async () => {
      sinon.stub(gitlabUtil, 'authenticatedGitlabApiRequest').resolves({
        name: 'web-semantica',
        web_url: 'https://gitlab.com/Lorylan/web-semantica',
        http_url_to_repo: 'http://gitlab.com/Lorylan/web-semantica.git'
      })

      const req = mockRequest({
        query: {
          gitUrl: 'https://gitlab.com/Lorylan/web-semantica.git'
        },
        user: {
          id: 5
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0].data).to.deep.equal({
        gitUrl: 'http://gitlab.com/Lorylan/web-semantica.git',
        name: 'web-semantica',
        repositoryUrl: 'https://gitlab.com/Lorylan/web-semantica',
        publicProfileUrl: null
      })

      gitlabUtil.authenticatedGitlabApiRequest.restore()
    })

    it ('returns 200 if it does not find a project and the repository does not exist', async () => {
      sinon.stub(githubUtil, 'authenticatedGithubApiRequest').throws('For some reason `rp` throws when a 404 is returned')

      const req = mockRequest({
        query: {
          gitUrl: 'git://github.com/kubernetes111/kubernetes11111111111.git'
        },
        user: {
          id: 5
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(204)
      expect(res.send.args[0][0]).to.deep.equal()

      githubUtil.authenticatedGithubApiRequest.restore()
    })

    it ('returns 500 if something goes wrong', async () => {
      sinon.stub(projectUtil, 'getOneByGitUrl').throws('No project found')
      const req = mockRequest({
        query: {
          gitUrl: 'git://gitlab.com/Flockademic/whereisscihub.git',
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(500)
      expect(res.send.args[0][0].error.meta.stack).to.include('No project found')
      projectUtil.getOneByGitUrl.restore()
    })

    it ('returns 204 if no project and no user', async () => {
      const req = mockRequest({
        query: {
          gitUrl: 'git://gitlab.com/notarepo/notaproject.git',
        }
      })
      const res = mockResponse()

      await PublicProfileController.publicProfileSearch(req, res)

      expect(res.status).to.have.been.calledWith(204)
    })
  })
});
