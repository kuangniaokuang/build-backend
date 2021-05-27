const UserUtil = require('../util/user')
const BadgeUtil = require('../util/badges')
const ProjectReportUtil = require('../util/reports/project')
const ProjectUtil = require('../util/project')
const responseFormatter = require('../util/apiResponseFormatter')
const providerUtil = require('../util/provider')
const { formatErrorResponse } = require('../util/apiResponseFormatter')
const { isValidGitUrl } = require('../util/validation')

const getRankingsForAllProjects = async (projects, user) => {
  const projectRankings = []
  for (let i = 0; i < projects.length; i++) {
    const repo = projects[i]
    const rankForProject = await ProjectReportUtil.getRankForProject(user, { gitUrl: repo.gitUrl })
    projectRankings.push(rankForProject)
  }
  return projectRankings
}

module.exports = {
  getUserProfile: async (req, res) => {
    try {
      let user = await UserUtil.findOne({
        id: req.params.id
      })

      if (!user || !user.dataValues) {
        return res.status(404).send('User Not Found')
      }
      user = user.dataValues

      if (!user.isPublic) {
        return res.status(404).send('User Not Found')
      }

      // Here we need to extract a list of emails and not a list of UserEmail objects
      user.emails = user.UserEmails.map(userEmail => {
        return userEmail.email
      })

      const me = await UserUtil.me(user)
      const reposWithMetrics = await ProjectReportUtil.getMyReposDevValueDevEqQuality(user)
      const badges = await BadgeUtil.getAllByUser(user.id)
      const topContributions = await ProjectReportUtil.topContributions(user)
      const repoRankings = await getRankingsForAllProjects(me.repos, user)
      const repos = ProjectUtil.mergeProjectArrays([me.repos, reposWithMetrics, repoRankings])

      return res.status(200).send({
        user: responseFormatter.formatUserObjectForApiResponse(me.user),
        badges: badges.map(responseFormatter.formatBadgeForApiResponse),
        topContributions: topContributions.map(responseFormatter.formatTopContributionsForApiResponse),
        repos: repos.map(responseFormatter.formatRepoForPublicProfileApiResponse)
      })
    } catch (error) {
      console.error('ERROR: PublicProfileController: getUserProfile: ', error)

      return res.status(404).send('User Not Found')
    }
  },

  publicProfileSearch: async (req, res) => {
    try {
      const { gitUrl } = req.query
      const { user } = req

      if (!isValidGitUrl(gitUrl)) {
        return res.status(400).send(formatErrorResponse('Not a valid git url', { gitUrl }))
      }

      const standardizedGitUrl = ProjectUtil.homogenizeGitUrl(gitUrl)
      const project = await ProjectUtil.getOneByGitUrl(standardizedGitUrl)

      if (project) {
        return res.status(200).send({
          data: {
            gitUrl: project.get('gitUrl'),
            name: project.get('name'),
            repositoryUrl: project.get('url'),
            publicProfileUrl: `projects/repository/overview?gitUrl=${project.get('gitUrl')}`
          }
        })
      }

      if (!user) {
        return res.status(204).send()
      }

      const repositoryData = await providerUtil.getRepoData(standardizedGitUrl, user.id)

      if (!repositoryData) {
        return res.status(204).send()
      }

      return res.status(200).send({
        data: {
          gitUrl: repositoryData.gitUrl,
          name: repositoryData.name,
          repositoryUrl: repositoryData.webUrl,
          publicProfileUrl: null
        }
      })
    } catch (error) {
      console.error('ProjectController:publicProfileSearch', error)

      return res.status(500).send(formatErrorResponse(
        'An unexpected error occurred while searching for project public profiles',
        { stack: error.stack }
      ))
    }
  }
}
