const errors = require('../util/errors')
const github = require('../util/github')
const gitlab = require('../util/gitlab')
const ProjectUtil = require('../util/project')
const {
  formatGithubRepoForApiResponse,
  formatGitlabRepoForApiResponse
} = require('../util/apiResponseFormatter')

const flagAlreadyAddedRepos = async (user, thirdPartyRepos) => {
  const currentRepos = await ProjectUtil.getAllByUserId(user.id)

  return thirdPartyRepos.map((thirdPartyRepo) => {
    const alreadyAdded = currentRepos.some((currentRepo) => {
      return currentRepo.gitUrl === thirdPartyRepo.gitUrl
    })

    return {
      ...thirdPartyRepo,
      alreadyAdded
    }
  })
}

module.exports = {
  listGithub: async (req, res) => {
    try {
      // Some notes about what we're fetching from github, and how we're doing it:
      // 1. /repos route itself will get us public repos owned by this user
      // 2. /repos + type=all will get us same as above AND public repos owned by other users in which this user is an official collaborator
      // 3. /events will get us public repos owned by other users for which this user has put up a PR
      //    (this is when scope is `public_repo`, if scope is `repo`, we can get private repos as well)
      const userRepos = await github.getProjectListFromGithub(req.user)
      const sharedRepos = await github.listGithubSharedRepos(req.user)

      const allRepos = userRepos.concat(sharedRepos).map(repo => {
        return formatGithubRepoForApiResponse(repo, req.user.githubUsername)
      })
      const flaggedRepos = await flagAlreadyAddedRepos(req.user, allRepos)

      return res.status(200).send({
        data: flaggedRepos,
        totalRecords: flaggedRepos.length
      })
    } catch (error) {
      errors.send(res, error, '378dhfjkn0d')
    }
  },

  listGitlab: async (req, res) => {
    try {
      const userRepos = await gitlab.getProjectListFromGitlab(req.user)

      const formattedRepos = userRepos.map(formatGitlabRepoForApiResponse)
      const flaggedRepos = await flagAlreadyAddedRepos(req.user, formattedRepos)

      return res.status(200).send({
        data: flaggedRepos,
        totalRecords: flaggedRepos.length
      })
    } catch (error) {
      errors.send(res, error, '1287yiuhfd9')
    }
  }
}
