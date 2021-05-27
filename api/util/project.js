const { v4: uuidv4 } = require('uuid')
const _ = require('lodash')
const { Op } = require('sequelize')

const qb = require('../util/queryBuilder')
const eeQuery = require('./eeQuery')
const { Project, Badge, User, UserProject, UserEmail } = require('../../db/models')
const Time = require('../util/time')
const queryBuilder = require('../util/queryBuilder')
const provider = require('./provider')
const github = require('./github')
const gitlab = require('./gitlab')
const repoHosts = require('../constants/repoHosts')

const deleteProjectForUser = async (project, userId) => {
  await project.removeUser(userId)
  await Badge.destroy({
    where: {
      project: project.get('id'),
      user: userId
    }
  })
}

module.exports = {
  findAll: async (options) => {
    return Project.findAll(options)
  },
  findAndCountAll: async (options) => {
    return await Project.findAndCountAll(options)
  },
  delete: async (gitUrl, userId) => {
    try {
      const project = await Project.findOne({
        include: [{
          model: User
        }],
        where: {
          gitUrl
        }
      })

      if (!project) {
        throw new Error('Project not found')
      }

      await deleteProjectForUser(project, userId)

      return project
    } catch (error) {
      throw new Error(error)
    }
  },

  deleteAllByUser: async (user) => {
    try {
      const projects = await Project.findAll({
        include: [{
          model: User,
          where: { id: user.id }
        }]
      })

      if (!projects) {
        throw new Error(`No projects not found for user ${user.email}`)
      } else {
        await Promise.all(projects.map(project => deleteProjectForUser(project, user.id)))

        return projects
      }
    } catch (error) {
      throw new Error(error)
    }
  },

  create: async (gitUrl, url, name, user) => {
    gitUrl = module.exports.homogenizeGitUrl(gitUrl)
    url = module.exports.homogenizeWebUrl(url)

    let project = await Project.findOne({
      where: { gitUrl }
    })

    if (!project) {
      project = await Project.create({
        url: url,
        gitUrl: gitUrl,
        name: name,
        eeProjectId: uuidv4(),
        incomingReportId: uuidv4(),
        nextProcessing: Time.getMidnight()
      })
    }

    await project.addUser(user.id)

    return project.dataValues
  },
  getReposWithMetrics: async (user) => {
    try {
      const reposQuery = qb.getReposWithMetrics(user)
      const results = await eeQuery.execute(reposQuery.sql, reposQuery.values)
      return results
    } catch (error) {
      console.error('ERROR: dfe33fdfxd: create repo in EE: ', error)
      throw new Error(error)
    }
  },
  setFavorite: async (gitUrl, userId, isFavorite) => {
    try {
      const project = await Project.findOne({
        where: { gitUrl }
      })

      const updated = project
        ? await UserProject.update(
            { isFavorite },
            {
              where: {
                UserId: userId,
                ProjectId: project.get('id')
              }
            }
          )
        : [0]

      return {
        gitUrl,
        success: updated[0] === 1
      }
    } catch (error) {
      throw new Error(error)
    }
  },

  getAllByUserId: async (userId, transaction) => {
    const projects = await Project.findAll({
      include: [{
        model: User,
        where: { id: userId }
      }],
      transaction
    })
    return projects.map((project) => {
      return project.dataValues
    })
  },

  getOneByGitUrl: async (gitUrl) => {
    return await Project.findOne({
      where: {
        gitUrl: {
          [Op.iLike]: gitUrl
        }
      }
    })
  },

  getAllByGitUrl: async (gitUrls) => {
    const projects = await Project.findAll({
      include: [
        {
          model: User
        }
      ],
      where: {
        gitUrl: {
          [Op.in]: gitUrls
        }
      }
    })
    return projects.map((project) => {
      return project.dataValues
    })
  },

  getFavorites: async (user) => {
    try {
      let favorites = await Project.findAll({
        include: [
          {
            model: User,
            where: {
              id: user.id
            },
            through: { where: { isFavorite: true } }
          }
        ]
      })

      // if the user does not have any favorites set, we return the most recent 6
      if (favorites.length === 0) {
        favorites = await Project.findAll({
          include: [{
            model: User,
            where: { id: user.id }
          }],
          order: [['eeLastSyncTime', 'DESC']],
          limit: 6
        })
      }

      return favorites
    } catch (error) {
      throw new Error(error)
    }
  },

  getByFavoritesOrGitUrl: async (gitUrls = [], user) => {
    return gitUrls.length > 0 ? await module.exports.getAllByGitUrl(gitUrls) : await module.exports.getFavorites(user)
  },

  update: async (projectUpdate, gitUrl) => {
    projectUpdate.gitUrl = module.exports.homogenizeGitUrl(projectUpdate.gitUrl)
    projectUpdate.url = module.exports.homogenizeWebUrl(projectUpdate.url)
    try {
      return await Project.update(projectUpdate, {
        where: {
          gitUrl
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  findOne: async (whereParams) => {
    try {
      return await Project.findOne({
        include: [{
          model: User,
          include: [{
            model: UserEmail
          }]
        }],
        where: whereParams
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  findOneWithAnalysisId: async (whereParams, analysisId) => {
    try {
      return await Project.findOne({
        include: [{
          model: User,
          include: [{
            model: UserEmail
          }],
          through: { where: { latestAnalysisId: analysisId } }
        }],
        where: whereParams
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  createProjectReportState: async (projectId, reportId) => {
    try {
      const query = queryBuilder.createProjectReportState(projectId, reportId)
      return await eeQuery.execute(query.sql, query.values)
    } catch (error) {
      throw new Error(error)
    }
  },

  updateProjectForReanalysis: async (projectId, reportId, status) => {
    await Project.update({
      incomingReportId: reportId,
      eeStatus: status
    }, {
      where: {
        id: projectId
      }
    })
  },

  updateProjectReportStateToFinished: async (reportId, analysisId) => {
    try {
      const query = queryBuilder.updateProjectReportStateToFinished(reportId, analysisId)
      return await eeQuery.execute(query.sql, query.values)
    } catch (error) {
      throw new Error(error)
    }
  },

  findReportStateByAnalysisId: async (analysisId) => {
    const query = queryBuilder.findProjectReportStateByAnalysisId(analysisId)
    const results = await eeQuery.execute(query.sql, query.values)

    return results[0].length
      ? results[0][0]
      : null
  },

  updateProjectWithAnalysisResults: async (eeProjectId, status, protobufFile, reportId) => {
    try {
      await Project.update({
        eeStatus: status,
        latestProtobuf: protobufFile,
        latestReportId: reportId,
        eeLastSyncTime: Date.now()
      }, {
        where: {
          eeProjectId
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  updateProjectReportProgress: async (reportId, progress) => {
    try {
      const query = queryBuilder.updateProjectReportProgress(reportId, progress)
      return await eeQuery.execute(query.sql, query.values)
    } catch (error) {
      throw new Error(error)
    }
  },

  getProjectsFrom3rdParties: async (projects, user) => {
    try {
      return await Promise.all(projects.map(project => {
        return provider.getRepoData(module.exports.homogenizeGitUrl(project.gitUrl), user.id)
      }))
    } catch (error) {
      // #636 Do not catch & re-throw errors here, filterGitProjectsBySize() will add failures to the queue.
      // Throwing an error here will stop parallel creation of multiple projects if at least one fails
      // throw error;
      console.log('ERROR: gpf3part', error)
    }
  },

  filterGitProjectsBySize: (gitProjects, requestProjects) => {
    const WARN_REPO_TOO_LARGE = 10000
    const validProjects = []
    const failures = []
    const warnings = []

    gitProjects.forEach((gitProject, index) => {
      const project = requestProjects[index]

      if (!gitProject) {
        failures.push({
          message: 'Unable to access repository',
          code: 'REPO_ACCESS',
          project
        })

        return
      }

      if (gitProject.size > WARN_REPO_TOO_LARGE) {
        // add any repos that are very large to warnings
        warnings.push({
          message: 'Repo is large and may take a while to analyze',
          code: 'REPO_TOO_BIG',
          project
        })
      }

      validProjects.push(project)
    })

    return {
      validProjects,
      warnings,
      failures
    }
  },

  updateUserProject: async (UserId, ProjectId, update) => {
    await UserProject.update(update, {
      where: {
        UserId,
        ProjectId
      }
    })
  },

  homogenizeGitUrl: (gitUrl) => {
    if (gitUrl) {
      return gitUrl.includes('github.com/') || gitUrl.includes('git@github.com:')
        ? github.makeGitUrlConsistent(gitUrl)
        : gitlab.makeGitUrlConsistent(gitUrl)
    }
  },

  homogenizeWebUrl: (url) => {
    if (url) {
      return url.includes('github.com/') || url.includes('git@github.com:')
        ? github.makeWebUrlConsistent(url)
        : gitlab.makeWebUrlConsistent(url)
    }
  },

  async getMyReposDevValueDevEqQuality (user) {
    const query = queryBuilder.getMyReposDevValueDevEqQuality(user)
    const results = await eeQuery.execute(query.sql, query.values)
    return results[0]
  },

  mergeProjectArrays (arrays) {
    const finalArray = []
    const tempObject = {}
    const allObjects = _.flatten(arrays)
    allObjects.forEach((obj) => {
      if (!tempObject[obj.gitUrl]) {
        tempObject[obj.gitUrl] = obj
      } else {
        tempObject[obj.gitUrl] = _.merge(obj, tempObject[obj.gitUrl])
      }
    })
    for (const key in tempObject) {
      finalArray.push(tempObject[key])
    }
    return finalArray
  },

  async getCommitRangeForLimit (gitUrl, commitLimit, userId) {
    try {
      let commitAfter = 0

      const commits = await module.exports.getCommits(gitUrl, commitLimit, userId)

      if (commits.length) {
        const remainder = (commitLimit % 100)
        const index = remainder > 0 ? remainder - 1 : commits.length - 1

        const lastCommit = commits.length < index ? commits[commits.length - 1] : commits[index]

        const commitDate = new Date(module.exports.getCommitDateFromCommit(gitUrl, lastCommit))
        commitAfter = (commitDate.getTime() / 1000) - 1
      }

      return {
        commitBefore: null,
        commitAfter
      }
    } catch (error) {
      // It's not worth completely failing if we can't get the commit range, so let's return a sensible default
      console.error('project.js:getCommitRangeForLimit', error)

      return {
        commitBefore: null,
        commitAfter: 0
      }
    }
  },

  getRepoHostFromGitUrl (gitUrl) {
    if (gitUrl.includes('github.com/')) {
      return repoHosts.github
    } else if (gitUrl.includes('gitlab.com/')) {
      return repoHosts.gitlab
    }

    throw new Error('Git url did not match any known repository hosts. gitUrl:', gitUrl)
  },

  async getCommits (gitUrl, commitLimit, userId) {
    return module.exports.getRepoHostFromGitUrl(gitUrl) === repoHosts.github
      ? await github.getCommits(gitUrl, commitLimit, userId)
      : await gitlab.getCommits(gitUrl, commitLimit, userId)
  },

  getCommitDateFromCommit (gitUrl, commit) {
    return module.exports.getRepoHostFromGitUrl(gitUrl) === repoHosts.github
      ? github.getCommitDateFromApiResponseCommitObject(commit)
      : gitlab.getCommitDateFromApiResponseCommitObject(commit)
  }
}
