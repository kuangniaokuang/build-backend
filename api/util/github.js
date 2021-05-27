const rp = require('request-promise')
const { Op } = require('sequelize')

const { User, UserEmail } = require('../../db/models')

// TODO: move github events into its own util
const GITHUB_EVENT_PULL_REQUEST = 'PullRequestEvent'
const GITHUB_PUSH_EVENT = 'PushEvent'
const PROVIDER = require('../../api/constants/repoHosts').github
const Encryption = require('../util/encryption')
const { getTokensForUser } = require('./tokens')
const repoHosts = require('../constants/repoHosts')

const getEvents = async (user) => {
  if (!user || !user.githubUsername) {
    return Promise.reject(new Error('github.js:getEvents: Invalid user'))
  }

  return await module.exports.authenticatedGithubApiRequest(`https://api.github.com/users/${user.githubUsername}/events?per_page=1000`, user.id)
}

const getEventsByType = async (user, eventTypes) => {
  const events = await getEvents(user)

  return events.filter((repo) => {
    return eventTypes.includes(repo.type)
  })
}

const addEmailsToUser = async (user, emailsArray) => {
  // This is needed since this code handles github and gitlab
  user = user[0] ? user[0].dataValues : user

  try {
    let foundUser = await User.findOne({
      where: {
        [Op.or]: [{
          githubUsername: user.username || user.githubUsername || ''
        },
        {
          gitlabUsername: user.username || user.gitlabUsername || ''
        }
        ]
      }
    })

    foundUser = foundUser.dataValues ? foundUser.dataValues : foundUser[0].dataValues

    const emailUpdates = {
      userEmailsUpdate: null,
      primaryEmailUpdate: null
    }

    const promises = []
    emailsArray.forEach(async (emailObject) => {
      const email = emailObject.email || emailObject.value
      promises.push(
        UserEmail.findOrCreate({
          where: {
            email,
            UserId: foundUser.id
          },
          defaults: {
            email,
            UserId: foundUser.id,
            isVerified: true
          }
        })
      )
    })

    emailUpdates.userEmailsUpdate = await Promise.all(promises)

    if (!foundUser.primaryEmail) {
      emailUpdates.primaryEmailUpdate = await User.update({
        primaryEmail: emailsArray[0].email || emailsArray[0].value
      }, {
        where: {
          id: foundUser.id
        }
      })
    }

    return emailUpdates
  } catch (error) {
    console.error('ERROR: sdkfjie7838: ', error)
    throw new Error(error)
  }
}

const getReposPaged = async (user, pageSize, page) => {
  // It's weirdly important that we include the `type=all` param in this request.
  // Github says that's the default, but their API responses say otherwise.

  return await module.exports.authenticatedGithubApiRequest(`${user.githubApiUrl}/repos?per_page=${pageSize}&page=${page}&type=all`, user.id)
}

module.exports = {
  authenticatedGithubApiRequest: async (uri, userId, githubAccessToken = null) => {
    if (!githubAccessToken) {
      // would be nice to cache the token
      const tokens = await getTokensForUser(userId)
      githubAccessToken = tokens.githubAccessToken
    }

    return await rp({
      uri,
      method: 'GET',
      headers: {
        'User-Agent': 'Request-Promise',
        Authorization: `Bearer ${Encryption.decrypt(githubAccessToken)}`
      },
      json: true
    })
  },

  getProjectListFromGithub: async (user, pageSize = 100, page = 1, allRepos = []) => {
    const results = await getReposPaged(user, pageSize, page)
    allRepos = allRepos.concat(results)
    if (results.length !== 0) {
      return await module.exports.getProjectListFromGithub(user, pageSize, page + 1, allRepos)
    } else {
      return allRepos
    }
  },
  getProject: async (uri, userId) => {
    // Use an authenticated request here to increase the Github API rate limit from 60 to 5,000
    return await module.exports.authenticatedGithubApiRequest(uri, userId)
  },
  getEmails: async (accessToken, userId) => {
    return await module.exports.authenticatedGithubApiRequest('https://api.github.com/user/emails', userId, accessToken)
  },
  getContributorInfoForCommit: async (commitHash, gitUrl, userId) => {
    const commit = await module.exports.getCommitForHash(commitHash, gitUrl, userId)

    const { author } = commit

    if (!author) {
      return null
    }

    const contributor = {
      email: commit.commit.author.email,
      remoteId: author.id,
      displayName: commit.commit.author.name,
      username: author.login,
      profileUrl: author.html_url,
      photoUrl: author.avatar_url,
      provider: repoHosts.github
    }

    return contributor
  },

  getCommitForHash: async (commitHash, gitUrl, userId) => {
    const repoPath = module.exports.getRepoPathFromGitUrl(gitUrl)
    const uri = `https://api.github.com/repos/${repoPath}/commits/${commitHash}`

    return await module.exports.authenticatedGithubApiRequest(uri, userId)
  },
  findPrimaryEmailAddress: (emails) => {
    const primaryEmail = emails.find((email) => email.primary)

    return primaryEmail ? primaryEmail.email : emails[0].email
  },
  addEmailsToUser: async (user, accessToken) => {
    try {
      user = user[0] ? user[0].dataValues : user
      const githubEmails = await module.exports.getEmails(accessToken, user.id)
      const primaryEmail = module.exports.findPrimaryEmailAddress(githubEmails)

      if (!user.primaryEmail || user.primaryEmail !== primaryEmail) {
        await User.update({
          primaryEmail
        }, {
          where: {
            githubUsername: user.githubUsername
          }
        })
      }

      return await addEmailsToUser(user, githubEmails)
    } catch (error) {
      console.error('ERROR: diue93n: addEmailsToUser: could not add github emails to user', error)
    }
  },
  // Show repos that
  //    1. User has pushed code to or created PRs for in the last 90 days
  //    2. User does not own
  //    3. Is public
  listGithubSharedRepos: async (user) => {
    try {
      const pushPullEvents = await getEventsByType(user, [GITHUB_EVENT_PULL_REQUEST, GITHUB_PUSH_EVENT])

      const sharedRepoApiUrls = []
      pushPullEvents.forEach((event) => {
        const repoUrl = event && event.repo && event.repo.url

        if (repoUrl && !repoUrl.includes(user.githubUsername) && !sharedRepoApiUrls.includes(repoUrl)) {
          sharedRepoApiUrls.push(repoUrl)
        }
      })

      // get information on those shared repos
      const sharedRepoResponses = await Promise.all(
        sharedRepoApiUrls.map((repoUrl) => {
          return module.exports.authenticatedGithubApiRequest(repoUrl, user.id)
        })
      )

      // filter out the private repos
      return sharedRepoResponses.filter((sharedRepo) => {
        return sharedRepo.private === false
      })
    } catch (error) {
      console.log('ERROR: Could not get shared repos', error)
      return []
    }
  },

  async getCommits (gitUrl, commitLimit, userId) {
    const slug = module.exports.getRepoPathFromGitUrl(gitUrl)
    const page = Math.ceil(commitLimit / 100)
    const apiUrl = `https://api.github.com/repos/${slug}/commits?page=${page}&per_page=100`

    return await module.exports.fetchCommitsForRepo(apiUrl, userId)
  },

  getRepoPathFromGitUrl (gitUrl) {
    // we're relying on gitUrls already being sanitized so we only have to deal with one format
    return gitUrl.replace('git://github.com/', '').replace('.git', '')
  },

  // fetchCommitsForRepo is a one line function, but it allows for a more sensible mocking strategy in our tests
  async fetchCommitsForRepo (uri, userId) {
    return await module.exports.authenticatedGithubApiRequest(uri, userId)
  },

  getCommitDateFromApiResponseCommitObject (commit) {
    return commit.commit.committer.date
  },

  makeGitUrlConsistent (gitUrl) {
    // eslint-disable-next-line no-useless-escape
    gitUrl = gitUrl.replace('\/', '/')

    if (gitUrl.startsWith('https://github')) {
      return gitUrl.replace('https', 'git')
    } else if (gitUrl.startsWith('http://github')) {
      return gitUrl.replace('http', 'git')
    } else if (gitUrl.startsWith('git@github.com:')) {
      return gitUrl.replace('git@github.com:', 'git://github.com/')
    }

    return gitUrl
  },

  makeWebUrlConsistent (webUrl) {
    // eslint-disable-next-line no-useless-escape
    webUrl = webUrl.replace('\/', '/')
    webUrl = webUrl.replace('git://', 'https://')
    webUrl = webUrl.replace('/repos/', '/')
    webUrl = webUrl.replace('git@github.com:', 'https://github.com/')
    webUrl = webUrl.replace(/\.git$/, '')
    webUrl = webUrl.replace('git://github.com', 'https://github.com')
    webUrl = webUrl.replace('api.github.com', 'github.com')
    return webUrl
  },

  getApiUrlFromWebUrl (webUrl) {
    let url = webUrl.replace(/\/\/github\.com/, '//api.github.com/repos')
    url = url.replace(/.git$/, '')
    return url.replace('git://', 'https://')
  },

  async getPullRequests (gitUrl, userId, pageNumber) {
    const apiUrl = module.exports.getApiUrlFromWebUrl(gitUrl)
    const uri = `${apiUrl}/pulls?state=all&per_page=100&page=${pageNumber}`
    const pullRequests = await module.exports.authenticatedGithubApiRequest(uri, userId)

    return pullRequests.map(pullRequest => {
      return {
        remoteId: pullRequest.id,
        apiUrl: pullRequest.url,
        state: pullRequest.state,
        title: pullRequest.title,
        provider: PROVIDER,
        username: pullRequest.user.login,
        authorRemoteId: pullRequest.user.id,
        createdAt: pullRequest.created_at ? new Date(pullRequest.created_at) : null,
        updatedAt: pullRequest.updated_at ? new Date(pullRequest.updated_at) : null,
        closedAt: pullRequest.closed_at ? new Date(pullRequest.closed_at) : null,
        mergedAt: pullRequest.merged_at ? new Date(pullRequest.merged_at) : null,
        mergeCommit: pullRequest.merge_commit_sha
      }
    })
  }
}
