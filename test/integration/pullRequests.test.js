const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
should = chai.should();

const github = require('../../api/util/github')
const gitlab = require('../../api/util/gitlab')
const pullRequestUtil = require('../../api/util/pullRequest')

const { findPullRequests } = require('../util/helpers')
const { pullRequests: mockGithubPullRequests } = require('../util/githubApiResponse')
const { pullRequests: mockGitlabPullRequests } = require('../util/gitlabApiResponse')

describe ('pull requests', () => {
  describe ('fetchAllForProject', () => {
    afterEach(() => {
      sinon.restore()
    })

    it('can fetch PRs and store them in our DB for github', async () => {
      let recursiveMethodStub = sinon.stub(github, 'authenticatedGithubApiRequest')
      recursiveMethodStub.onFirstCall().returns([
        {
          ...mockGithubPullRequests[0],
          user: {
            ...mockGithubPullRequests[0].user,
            id: 12345 // contributor 1
          }
        }
      ]);
      recursiveMethodStub.onSecondCall().returns([
        {
          ...mockGithubPullRequests[0],
          id: 95843759,
          user: {
            ...mockGithubPullRequests[0].user,
            login: 'mericoqa3' // userId 5
          }
        }
      ]);
      recursiveMethodStub.onThirdCall().returns([]);

      const gitUrl = 'git://github.com/stripe/terminal-js.git'
      const userId = 5
      const eeProjectId = '20892fe4-cb24-4a13-965f-8c982cdad194'

      await pullRequestUtil.fetchAllForProject(gitUrl, eeProjectId, userId)

      const pullRequests = await findPullRequests({ project: eeProjectId })

      pullRequests.should.have.length(2)
      pullRequests[0].get('author').should.equal(1)
      pullRequests[1].get('user').should.equal(5)
    })

    it ('does not create PRs when the PR has not been merged', async () => {
      let recursiveMethodStub = sinon.stub(github, 'authenticatedGithubApiRequest')
      recursiveMethodStub.onFirstCall().returns([
        {
          ...mockGithubPullRequests[0],
          user: {
            ...mockGithubPullRequests[0].user,
            id: 12345 // contributor 1
          },
          id: 8976786,
          merged_at: null
        }
      ]);
      recursiveMethodStub.onSecondCall().returns([]);

      const gitUrl = 'git://github.com/stripe/terminal-js.git'
      const userId = 5
      const eeProjectId = '20892fe4-cb24-4a13-965f-8c982cdad194'

      await pullRequestUtil.fetchAllForProject(gitUrl, eeProjectId, userId)

      const pullRequests = await findPullRequests({ remoteId: 8976786 })

      pullRequests.length.should.equal(0)
    })

    it('can fetch PRs and store them in our DB for gitlab', async () => {
      let recursiveMethodStub = sinon.stub(gitlab, 'authenticatedGitlabApiRequest')
      recursiveMethodStub.onFirstCall().returns([
        {
          ...mockGitlabPullRequests[0],
          id: 32490423,
          author: {
            ...mockGitlabPullRequests[0].author,
            id: 1855027 // contributor 3
          }
        }
      ]);
      recursiveMethodStub.onSecondCall().returns([
        {
          ...mockGitlabPullRequests[0],
          id: 52347865,
          author: {
            ...mockGitlabPullRequests[0].author,
            username: 'mericoqa1' // userId 6
          }
        }
      ]);
      recursiveMethodStub.onThirdCall().returns([]);

      const gitUrl = 'https://gitlab.com/Flockademic/whereisscihub.git'
      const userId = 6
      const eeProjectId = '30ce23b0-bed4-4fb5-84b0-3c54d454286c'

      await pullRequestUtil.fetchAllForProject(gitUrl, eeProjectId, userId)

      const pullRequests = await findPullRequests({ project: eeProjectId })

      pullRequests.should.have.length(5)
      pullRequests[3].get('author').should.equal(3)
      pullRequests[4].get('user').should.equal(6)
    })

    it ('doesn\'t just roll over and die when it can\'t create a PR', async () => {
      let recursiveMethodStub = sinon.stub(github, 'authenticatedGithubApiRequest')
      recursiveMethodStub.onFirstCall().returns([
        {
          ...mockGithubPullRequests[0],
          id: 523478652, // unique id
          user: {
            ...mockGithubPullRequests[0].user,
            id: 12345 // contributor 1
          },
          merge_commit_sha: null // this will make it throw
        }
      ]);
      recursiveMethodStub.onSecondCall().returns([]);

      const gitUrl = 'git://github.com/stripe/terminal-js.git'
      const userId = 5
      const eeProjectId = '20892fe4-cb24-4a13-965f-8c982cdad194'

      await pullRequestUtil.fetchAllForProject(gitUrl, eeProjectId, userId)
    })
  })
})
