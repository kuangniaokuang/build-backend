const eeQuery = require('../util/eeQuery')
const converter = require('../util/eeToCEDataConverter')
const errors = require('../util/errors')
const validate = require('../util/validation')
const ProjectUtil = require('../util/project')
const projectProfileUtil = require('../util/projectProfile')
const BadgeUtil = require('../util/badges')
const INVALID_GIT_URL = 'You must specify a git URL like this: https://github.com/joncodo/p5CodingChallenge.git'
const codeAnalysis = require('../util/codeAnalysis')
const { getProjectDevRankings } = require('../util/analyticsApi/reportData')
const {
  formatBasicProjectForApiResponse,
  formatFullProjectForApiResponse,
  formatFavoriteResults,
  formatDevRankingMetricsForProject,
  formatErrorResponse
} = require('../util/apiResponseFormatter')

const formatCreateManyResponse = (successes, warnings, failures) => {
  return {
    successes: successes.map(formatBasicProjectForApiResponse),
    warnings,
    failures
  }
}

module.exports = {
  projectCount: (req, res) => {
    const sql = 'select count(id) from "Projects"'
    eeQuery.execute(sql, [], res, (rows) => {
      return res.status(200).send({ rows })
    })
  },

  projects: async (req, res) => {
    const count = req.query.count || 10
    const start = req.query.start || 0
    const sortColumn = req.query.sortColumn
    const sortDirection = req.query.sortDirection
    const isFavorite = req.query.isFavorite

    try {
      const { projects, totalRecords } = await converter.getUserProjectsWithEEData(
        req.user,
        start,
        count,
        sortColumn,
        sortDirection,
        isFavorite
      )

      return res.status(200).send({
        data: projects.map(formatFullProjectForApiResponse),
        totalRecords
      })
    } catch (error) {
      console.error('ERROR: ProjectController:projects: ', error)
      return res.status(500).send('ERROR: ProjectController:projects: ' + error)
    }
  },

  create: async (req, res) => {
    try {
      const results = await ProjectUtil.create(req.body.gitUrl, req.body.url, req.body.name, req.user)
      await codeAnalysis.analyze(results.gitUrl, req.user.id)

      return res.status(200).send(formatBasicProjectForApiResponse(results))
    } catch (error) {
      errors.send(res, error, '234fdfqqwdf')
    }
  },

  createMany: async (req, res) => {
    try {
      const { projectsAdded, warnings, failures } = await module.exports.createManyProjects(req.body.projects, req.user)

      if (!projectsAdded.length) {
        return res.status(200).send(formatCreateManyResponse([], warnings, failures))
      }

      const analyses = await module.exports.submitManyProjectsForAnalysis(projectsAdded, req)
      const allWarnings = module.exports.updateWarningsWithAnalysis(projectsAdded, warnings, analyses)

      return res.status(200).send(formatCreateManyResponse(projectsAdded, allWarnings, failures))
    } catch (error) {
      console.log('ProjectController.js:createMany', error)

      errors.send(res, error, 'ProjectController.js:createMany')
    }
  },

  createManyProjects: async (projects, user) => {
    try {
      const projectCreatePromises = []
      const projectsAdded = []
      const gitProjects = await ProjectUtil.getProjectsFrom3rdParties(projects, user)
      const { validProjects, warnings, failures } = ProjectUtil.filterGitProjectsBySize(gitProjects, projects)

      validProjects.forEach(async (project) => {
        projectCreatePromises.push(
          ProjectUtil.create(project.gitUrl, project.url, project.name, user).catch((e) => e)
        )
      })

      await Promise.all(projectCreatePromises).then((results) => {
        results.forEach((result, index) => {
          if (result instanceof Error) {
            console.error('ProjectController.js:createManyProjects', results)

            failures.push({
              message: 'Repo failed to add',
              code: 'REPO_EXISTS',
              project: validProjects[index]
            })
          } else {
            projectsAdded.push(result)
          }
        })
      })

      return { projectsAdded, warnings, failures }
    } catch (error) {
      console.error('ProjectController.js:createManyProjects failed to create projects', error)

      throw error
    }
  },

  submitManyProjectsForAnalysis: async (projects, req) => {
    try {
      const analysisSubmissionPromises = []
      projects.forEach(async (project) => {
        analysisSubmissionPromises.push(codeAnalysis.analyze(project.gitUrl, req.user.id))
      })

      return await Promise.all(analysisSubmissionPromises.map((p) => p.catch((e) => e)))
    } catch (error) {
      console.error('ProjectController.js:submitManyProjectsForAnalysis failed to submit', error)
    }
  },

  updateWarningsWithAnalysis: (projects, createWarnings, analyses) => {
    const warnings = []

    projects.forEach(project => {
      const warning = createWarnings.find(warning => warning.project.gitUrl === project.gitUrl)
      const analysis = analyses.find(analysis => analysis.gitUrl === project.gitUrl)

      if (analysis && analysis.options.commitAfter) {
        const commitLimitMessage = `Due to the large size of this repository, we can only process the most recent ${analysis.options.commitLimit} commits.`

        const newWarning = warning
          ? {
              ...warning,
              message: `${warning.message}. ${commitLimitMessage}`
            }
          : {
              message: commitLimitMessage,
              code: 'REPO_TOO_BIG',
              project
            }

        warnings.push(newWarning)
      } else if (warning) {
        warnings.push(warning)
      }
    })

    return warnings
  },

  delete: async (req, res) => {
    const gitUrl = req.query.gitUrl || req.body.gitUrl

    if (!gitUrl && validate.isValidGitUrl(gitUrl)) {
      return res.status(500).send(INVALID_GIT_URL)
    }

    try {
      const deletedProject = await ProjectUtil.delete(gitUrl, req.user.id)

      const remainingProjects = await ProjectUtil.getAllByUserId(req.user.id)

      // TODO: DRY this up (it's very similar to what happens in deleteMany)
      if (!remainingProjects.length) {
        BadgeUtil.deleteAllByUser(req.user)
      } else {
        // TODO: should this be done in a sequelize hook (Project.onDelete)?
        await BadgeUtil.deleteProjectSpecificBadges(deletedProject.getDataValue('id'), req.user.id)

        // TODO: make this better
        const remainingProject = remainingProjects[0]
        await BadgeUtil.generateGlobalBadges(remainingProject.id, req.user.id)
      }

      return res.status(200).send({ data: formatFullProjectForApiResponse(deletedProject) })
    } catch (error) {
      errors.send(res, error, '89237yjkfdfd')
    }
  },

  deleteMany: async (req, res) => {
    const gitUrls = req.body.gitUrls

    if (!gitUrls && validate.isInvalidGitUrlArray(gitUrls)) {
      return res.status(500).send(INVALID_GIT_URL)
    }

    try {
      const promises = []

      gitUrls.forEach(async (gitUrl) => {
        promises.push(ProjectUtil.delete(gitUrl, req.user.id))
      })

      const deletedProjects = await Promise.all(promises)
      const remainingProjects = await ProjectUtil.getAllByUserId(req.user.id)

      // TODO: move this badge stuff into a separate function within this file
      if (!remainingProjects.length) {
        BadgeUtil.deleteAllByUser(req.user)
      } else {
        // TODO: should this be done in a sequelize hook (Project.onDelete)?
        const badgeDeletionPromises = []

        deletedProjects.forEach((project) => {
          badgeDeletionPromises.push(BadgeUtil.deleteProjectSpecificBadges(project.getDataValue('id'), req.user.id))
        })
        await Promise.all(badgeDeletionPromises)

        // TODO: make this better
        await BadgeUtil.generateGlobalBadges(remainingProjects[0].id, req.user.id)
      }

      return res.status(200).send('All selected repos were deleted')
    } catch (error) {
      errors.send(res, error, 'lsd0d9kfj83')
    }
  },

  setFavoriteRepos: async (req, res) => {
    try {
      const projects = req.body.projects

      if (!projects) {
        return res.status(400).send('You must pass projects in the body [{id: 1, isFavorite:true}]')
      }

      const promises = projects.map(project => ProjectUtil.setFavorite(project.gitUrl, req.user.id, project.isFavorite))
      const results = await Promise.all(promises)

      return res.status(200).send(formatFavoriteResults(results))
    } catch (error) {
      errors.send(res, error, 'sdfkjdiu')
    }
  },

  /**
   * @deprecated
   */
  getCeRepos: async (req, res) => {
    try {
      const projects = await ProjectUtil.findAll()

      return res.status(200).send({ projects })
    } catch (error) {
      errors.send(res, error, 'sdfkjh38')
    }
  },

  allDevMetricsForProject: async (req, res) => {
    try {
      const { gitUrl, startDate, endDate } = req.query
      const userId = req.user.id
      const project = await ProjectUtil.findOne({
        gitUrl: gitUrl
      })

      if (!project) {
        return res.status(404).send({ error: 'Project not found' })
      }

      const user = project.get('Users').find(user => user.get('id') === userId)
      if (!user) {
        return res.status(401).send({ error: 'Project does not belong to user' })
      }

      const rawMetrics = await getProjectDevRankings(gitUrl, startDate, endDate, user.get('primaryEmail'))

      const formattedMetrics = rawMetrics.map(formatDevRankingMetricsForProject)

      return res.status(200).send({ data: formattedMetrics })
    } catch (error) {
      errors.send(res, error, 'ProjectController:devMetricsForProject')
    }
  },

  publicProfile: async (req, res) => {
    try {
      const { gitUrl } = req.query

      const project = await ProjectUtil.getOneByGitUrl(ProjectUtil.homogenizeGitUrl(gitUrl))

      if (!project) {
        return res.status(404).send(formatErrorResponse('No project found for that gitUrl', { gitUrl }))
      }

      const { topContributors, population, velocity, merges, interval } = await projectProfileUtil.getPublicProfile(project)

      return res.status(200).send({
        data: {
          gitUrl: project.get('gitUrl'),
          name: project.get('name'),
          webUrl: project.get('url'),
          interval,
          topContributors,
          population,
          velocity,
          merges
        }
      })
    } catch (error) {
      console.error('ProjectController:publicProfile', error)

      return res.status(500).send(formatErrorResponse(
        'An unexpected error occurred getting the project public profile',
        { stack: error.stack }
      ))
    }
  }
}
