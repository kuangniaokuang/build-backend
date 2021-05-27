const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
should = chai.should()

const contributorUtil = require("../../api/util/contributors")
const github = require('../../api/util/github')
const gitlab = require('../../api/util/gitlab')
const auth = require('../../api/util/auth')
const helpers = require("../util/helpers")
const { singleCommit: githubCommit } = require('../util/githubApiResponse')
const gitlabApiResponse = require('../util/gitlabApiResponse')
const Factory = require('../factory')
const { Project } = require('../../db/models')
const factory = require('../factory')
const { execute } = require('../../api/util/eeQuery')
const badgeImageGenerator = require('../../api/util/badges/badgeImageGenerator')

const deleteContributors = async (contributors) => {
  return await helpers.deleteContributorsById(contributors.map(({ id }) => id ))
}

describe ("contributors", () => {

  beforeEach(() => {
    sinon.stub(badgeImageGenerator, 'create').returns('ANY')
    sinon.stub(badgeImageGenerator, 'upload').returns('ANY')
  })

  afterEach(() => {
    sinon.restore()
  })

  after(async () => {
    await Factory.destroyAll()
  })

  describe ("createForProject", () => {
    it ("creates contributors for github repo", async () => {
      sinon.stub(github, 'authenticatedGithubApiRequest').resolves(githubCommit)

      const project = await helpers.getProject(13) // git://github.com/stripe/terminal-js.git

      const contributors = await contributorUtil.createContributorsForProject(project)

      contributors.should.have.length(10)

      const contributor = contributors[0]

      contributor.get('email').should.equal('bibek@stripe.com')
      contributor.get('displayName').should.equal('Bibek Ghimire')
      contributor.get('username').should.equal('bibek-stripe')
      contributor.get('profileUrl').should.equal('https://github.com/bibek-stripe')
      contributor.get('photoUrl').should.equal('https://avatars.githubusercontent.com/u/56042317?v=4')
      contributor.get('provider').should.equal('github')
      contributor.get('remoteId').should.equal(56042317)

      await deleteContributors(contributors)
    })

    it ('creates contributors even if there is no data back from Github', async () => {
      sinon.stub(github, 'authenticatedGithubApiRequest').resolves({
        ...githubCommit,
        author: null
      })

      const userId = 5 // mericoqa3
      const projectId = 13 // git://github.com/stripe/terminal-js.git

      const project = await helpers.getProject(projectId)

      const contributors = await contributorUtil.createContributorsForProject(project, userId)

      contributors.should.have.length(10)

      expect(contributors[0]['remoteId']).to.be.null
      expect(contributors[0]['provider']).to.equal('github')

      await deleteContributors(contributors)
    })

    it("creates contributors for gitlab repo", async () => {
      sinon.stub(gitlab, 'authenticatedGitlabApiRequest').resolves(gitlabApiResponse.users)
      const userId = 5 // mericoqa3

      // fake project because no gitlab projects in test db
      const project = Project.build({
        gitUrl: 'https://gitlab.com/stripe/terminal-js.git',
        eeProjectId: '20892fe4-cb24-4a13-965f-8c982cdad194',
      })

      const contributors = await contributorUtil.createContributorsForProject(project, userId)

      contributors.should.have.length(10)

      const contributor = contributors[0]

      contributor.get('email').should.equal('39812724+jil-stripe@users.noreply.github.com')
      contributor.get('displayName').should.equal('James Fernandes')
      contributor.get('username').should.equal('jamesfernandes')
      contributor.get('profileUrl').should.equal('https://gitlab.com/jamesfernandes')
      contributor.get('photoUrl').should.equal('https://secure.gravatar.com/avatar/56b152e7365c7cad63cb18da3b7c5ad3?s=80&d=identicon')
      contributor.get('provider').should.equal('gitlab')
      contributor.get('remoteId').should.equal(8767653)

      await deleteContributors(contributors)
    })

    it ('creates contributors even if there is no data back from Gitlab', async () => {
      sinon.stub(gitlab, 'authenticatedGitlabApiRequest').resolves([])
      const userId = 5 // mericoqa3

      const project = {
        gitUrl: 'https://gitlab.com/stripe/terminal-js.git', // fake git url because no gitlab projects in test db
        eeProjectId: '20892fe4-cb24-4a13-965f-8c982cdad194', // the real project id for terminal-js
      }

      const contributors = await contributorUtil.createContributorsForProject(project, userId, 1)

      contributors.should.have.length(10)

      expect(contributors[0]['remoteId']).to.be.null
      expect(contributors[0]['provider']).to.equal('gitlab')
    })

    it ('deletes a contributor when they join as a user', async () => {
      const contributorEmail = 'bibek@stripe.com'

      const contributorBefore = await helpers.findContributorByEmail(contributorEmail)
      expect(contributorBefore).to.not.be.null

      const pullRequest = await factory.createPullRequest('20892fe4-cb24-4a13-965f-8c982cdad194', contributorBefore.get('id'))
      expect(pullRequest.get('author')).to.equal(contributorBefore.get('id'))
      expect(pullRequest.get('user')).to.be.null

      const userToCreate = {
        primaryEmail: contributorEmail,
        githubUsername: 'bibek-stripe'
      }

      await auth.createNewUser(userToCreate, {}, [contributorEmail])

      const contributor = await helpers.findContributorByEmail(contributorEmail)

      expect(contributor).to.be.null

      await pullRequest.reload()
      expect(pullRequest.get('author')).to.be.null
      expect(pullRequest.get('user')).to.not.be.null
    })
  })
})
