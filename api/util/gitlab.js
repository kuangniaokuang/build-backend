const rp = require('request-promise')

const Encryption = require('./encryption')
const { getTokensForUser } = require('./tokens')
const repoHosts = require('../constants/repoHosts')
const PROVIDER = require('../../api/constants/repoHosts').gitlab

module.exports = {
  authenticatedGitlabApiRequest: async (uri, userId) => {
    const { gitlabAccessToken } = await getTokensForUser(userId)

    const options = {
      uri,
      method: 'GET',
      headers: {
        'User-Agent': 'Request-Promise',
        Authorization: `Bearer ${Encryption.decrypt(gitlabAccessToken)}`
      },
      json: true
    }

    return rp(options)
  },

  getProjectListFromGitlab: (user) => {
    return rp({
      uri: `https://gitlab.com/api/v4/users/${user.gitlabUsername}/projects`,
      method: 'GET',
      headers: { 'User-Agent': 'Request-Promise' },
      json: true
    })
  },
  getProjectForGitUrl: async (gitUrl, userId) => {
    try {
      const repoSlug = module.exports.getRepoPathFromGitUrl(gitUrl)
      const uri = `https://gitlab.com/api/v4/projects/${repoSlug}?statistics=true`

      return await module.exports.authenticatedGitlabApiRequest(uri, userId)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  test: async () => {
    const options = {
      uri: 'https://gitlab.com/api/v4/projects/joncodo%2Dmerico%2FTest-repo-merico?statistics=true',
      method: 'GET',
      headers: {
        'User-Agent': 'Request-Promise',
        Authorization: 'Bearer 28fa5f763918b5d42ba188b74114a89b2ec078a4e41dc5950892d4ba8ad59e68'
      },
      json: true
    }
    const results = await rp(options)
    return results
  },

  async getCommits (gitUrl, commitLimit, userId) {
    const slug = encodeURIComponent((module.exports.getRepoPathFromGitUrl(gitUrl)))
    const page = Math.ceil(commitLimit / 100)
    const apiUrl = `https://gitlab.com/api/v4/projects/${slug}/repository/commits?all=true&per_page=100&page=${page}`

    return await module.exports.fetchCommitsForRepo(apiUrl, userId)
  },

  getRepoPathFromGitUrl (gitUrl) {
    return gitUrl.replace('https://gitlab.com/', '')
      .replace('git@gitlab.com:', '')
      .replace('.git', '')
      .replace('git://gitlab.com/', '')
  },

  async fetchCommitsForRepo (uri, userId) {
    return await module.exports.authenticatedGitlabApiRequest(uri, userId)
  },

  getCommitDateFromApiResponseCommitObject (commit) {
    return commit.committed_date
  },

  getContributorInfoForEmail: async (email, userId) => {
    const user = await module.exports.getUserForEmail(email, userId)

    if (!user) {
      return null
    }

    return {
      email: email,
      remoteId: user.id,
      displayName: user.name,
      username: user.username,
      profileUrl: user.web_url,
      photoUrl: user.avatar_url,
      provider: repoHosts.gitlab
    }
  },

  async getUserForEmail (email, userId) {
    const uri = `https://gitlab.com/api/v4/users?search=${email}`

    const users = await module.exports.authenticatedGitlabApiRequest(uri, userId)

    return users.length
      ? users[0]
      : null
  },

  makeGitUrlConsistent (gitUrl) {
    // eslint-disable-next-line no-useless-escape
    gitUrl = gitUrl.replace('\/', '/')

    if (gitUrl.startsWith('git@gitlab.com:')) {
      return gitUrl.replace('git@gitlab.com:', 'https://gitlab.com/')
    } else if (gitUrl.startsWith('git://gitlab')) {
      return gitUrl.replace('git', 'https')
    } else if (gitUrl.startsWith('http://gitlab')) {
      return gitUrl.replace('http', 'https')
    }

    return gitUrl
  },

  makeWebUrlConsistent (webUrl) {
    // eslint-disable-next-line no-useless-escape
    webUrl = webUrl.replace('\/', '/')
    webUrl = webUrl.replace('git://', 'https://')
    webUrl = webUrl.replace('/repos/', '/')
    webUrl = webUrl.replace('git@gitlab.com:', 'https://gitlab.com/')
    webUrl = webUrl.replace(/\.git$/, '')
    webUrl = webUrl.replace('git://gitlab.com', 'https://gitlab.com')
    webUrl = webUrl.replace('api.gitlab.com', 'gitlab.com')
    return webUrl
  },

  getApiUrlFromWebUrl (webUrl) {
    // I feel bad writing this code and it needs to be refactored in another task
    // We REALLY need a new model that saves all meta data from github and gitlab called repo.
    const repoPath = encodeURIComponent(module.exports.getRepoPathFromGitUrl(webUrl))

    return `https://gitlab.com/api/v4/projects/${repoPath}`
  },

  async getPullRequests (gitUrl, userId, pageNumber) {
    const apiUrl = module.exports.getApiUrlFromWebUrl(gitUrl)
    const uri = `${apiUrl}/merge_requests?state=all&per_page=100&page=${pageNumber}`
    const pullRequests = await module.exports.authenticatedGitlabApiRequest(uri, userId)

    return pullRequests.map(pullRequest => {
      return {
        remoteId: pullRequest.id,
        apiUrl: pullRequest.web_url,
        state: pullRequest.state,
        title: pullRequest.title,
        username: pullRequest.author.username,
        authorRemoteId: pullRequest.author.id,
        provider: PROVIDER,
        createdAt: pullRequest.created_at ? new Date(pullRequest.created_at) : null,
        updatedAt: pullRequest.updated_at ? new Date(pullRequest.updated_at) : null,
        closedAt: pullRequest.closed_at ? new Date(pullRequest.closed_at) : null,
        mergedAt: pullRequest.merged_at ? new Date(pullRequest.merged_at) : null,
        mergeCommit: pullRequest.sha
      }
    })
  }
}
