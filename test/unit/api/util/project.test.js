const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
should = chai.should();
const sinonChai = require('sinon-chai')
chai.use(sinonChai)

const github = require('../../../../api/util/github')
const gitlab = require('../../../../api/util/gitlab')
const { getCommitRangeForLimit } = require('../../../../api/util/project')
const { commits: githubCommits } = require('../../../util/githubApiResponse')
const { commits: gitlabCommits } = require('../../../util/gitlabApiResponse')

describe ('project utils', () => {
  afterEach(() => {
    sinon.restore()
  })

  describe ('getCommitRangeForLimit', () => {
    it ('returns a sensible default if there is an error', async () => {
      sinon.stub(github, 'fetchCommitsForRepo').rejects('Failed to fetch commits')

      const gitUrl = 'git://github.com/axios/axios.git'
      const commitLimit = 2500

      const { commitBefore, commitAfter } = await getCommitRangeForLimit(gitUrl, commitLimit)

      const now = Math.floor(Date.now() / 1000)

      commitAfter.should.equal(0)
      expect(commitBefore).to.be.null
    })

    describe ('Github', () => {
      it ('returns the infinite commit range for github when no commits found', async () => {
        sinon.stub(github, 'fetchCommitsForRepo').resolves([])

        const gitUrl = 'git://github.com/axios/axios.git'
        const commitLimit = 2500

        const { commitBefore, commitAfter } = await getCommitRangeForLimit(gitUrl, commitLimit)

        expect(github.fetchCommitsForRepo.args[0][0]).to.equal('https://api.github.com/repos/axios/axios/commits?page=25&per_page=100')

        const now = Math.floor(Date.now() / 1000)

        commitAfter.should.equal(0)
        expect(commitBefore).to.be.null
      })

      it ('returns the correct timestamp commit range for github when a max commit time is found', async () => {
        sinon.stub(github, 'fetchCommitsForRepo').resolves(githubCommits)

        const gitUrl = 'git://github.com/axios/axios.git'
        const commitLimit = 1000

        const { commitBefore, commitAfter } = await getCommitRangeForLimit(gitUrl, commitLimit)

        expect(github.fetchCommitsForRepo.args[0][0]).to.equal('https://api.github.com/repos/axios/axios/commits?page=10&per_page=100')

        const now = Math.floor(Date.now() / 1000)

        commitAfter.should.equal(1408401606)
        expect(commitBefore).to.be.null
      })
    })

    describe ('Gitlab', () => {
      it ('returns the infinite commit range for gitlab when no commits found', async () => {
        sinon.stub(gitlab, 'fetchCommitsForRepo').resolves([])

        const gitUrl = 'https://gitlab.com/inkscape/inkscape.git'
        const commitLimit = 2500

        const { commitBefore, commitAfter } = await getCommitRangeForLimit(gitUrl, commitLimit)

        expect(gitlab.fetchCommitsForRepo.args[0][0]).to.equal('https://gitlab.com/api/v4/projects/inkscape%2Finkscape/repository/commits?all=true&per_page=100&page=25')

        const now = Math.floor(Date.now() / 1000)

        commitAfter.should.equal(0)
        expect(commitBefore).to.be.null
      })

      it ('returns the correct timestamp commit range for gitlab when a max commit time is found', async () => {
        sinon.stub(gitlab, 'fetchCommitsForRepo').resolves(gitlabCommits)

        const gitUrl = 'https://gitlab.com/inkscape/inkscape.git'
        const commitLimit = 1000

        const { commitBefore, commitAfter } = await getCommitRangeForLimit(gitUrl, commitLimit)

        expect(gitlab.fetchCommitsForRepo.args[0][0]).to.equal('https://gitlab.com/api/v4/projects/inkscape%2Finkscape/repository/commits?all=true&per_page=100&page=10')

        const now = Math.floor(Date.now() / 1000)

        commitAfter.should.equal(1615292815)
        expect(commitBefore).to.be.null
      })
    })
  })
})
