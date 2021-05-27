const github = require('./github')
const gitlab = require('./gitlab')
const repoHosts = require('../constants/repoHosts')

module.exports = {
  getProviderFromGitUrl (gitUrl) {
    if (gitUrl.includes('github.com/')) {
      return repoHosts.github
    } else if (gitUrl.includes('gitlab.com')) {
      return repoHosts.gitlab
    }

    throw new Error('Git url did not match any known repository hosts. gitUrl:', gitUrl)
  },

  async getContributorInfo (commitHash, gitUrl, email, authorName, userId) {
    const provider = module.exports.getProviderFromGitUrl(gitUrl)

    const contributorInfo = provider === repoHosts.github
      ? await github.getContributorInfoForCommit(commitHash, gitUrl, userId)
      : await gitlab.getContributorInfoForEmail(email, userId)

    return contributorInfo || module.exports.createBasicContributorInfo(email, authorName, provider)
  },

  createBasicContributorInfo (email, displayName, provider) {
    return {
      email,
      displayName,
      provider,
      remoteId: null
    }
  },

  async getPullRequestData (gitUrl, userId, pageNumber) {
    const provider = module.exports.getProviderFromGitUrl(gitUrl)

    return provider === repoHosts.github
      ? await github.getPullRequests(gitUrl, userId, pageNumber)
      : await gitlab.getPullRequests(gitUrl, userId, pageNumber)
  },

  async getRepoData (gitUrl, userId) {
    try {
      let repoData = null

      switch (module.exports.getProviderFromGitUrl(gitUrl)) {
        case repoHosts.github: {
          const githubRepoData = await github.getProject(github.getApiUrlFromWebUrl(gitUrl), userId)

          repoData = module.exports.formatRepoDataFromGithub(githubRepoData)
          break
        }

        case repoHosts.gitlab: {
          const gitlabRepoData = await gitlab.getProjectForGitUrl(gitUrl, userId)

          repoData = module.exports.formatRepoDataFromGitlab(gitlabRepoData)
          break
        }
      }

      return repoData
    } catch (error) {
      console.error('provider.getRepoData', error)

      return null
    }
  },

  formatRepoDataFromGithub (repoData) {
    return {
      gitUrl: repoData.git_url,
      name: repoData.name,
      webUrl: repoData.html_url,
      size: repoData.size
    }
  },

  formatRepoDataFromGitlab (repoData) {
    return {
      gitUrl: repoData.http_url_to_repo,
      name: repoData.name,
      webUrl: repoData.web_url,
      size: repoData.statistics && repoData.statistics.storage_size / 1000
    }
  }
}
