const { Op } = require('sequelize')
const _has = require('lodash/has')

const { BenchmarkRepo, Project } = require('../../db/models')
const Time = require('../../api/util/time')
const { analyze } = require('../../api/util/codeAnalysis')
const ProjectUtil = require('../../api/util/project')
const aeHelper = require('../../api/util/aeHelper')
const { getFromGithubAPI } = require('./common')
const { assertQueue } = require('../../api/util/rabbitMQ')

const TASK_COMMIT_QUEUE = 'task_commit'

const formatError = (funcName, error) => {
  error.message = `analyzeBenchmarkRepo.js:${funcName} -> ${error.message}`

  return error
}

const aeHasAdequateCapacity = async () => {
  try {
    const options = {
      arguments: {
        'x-max-priority': 10
      }
    }
    const queue = await assertQueue(TASK_COMMIT_QUEUE, options)

    return queue.consumerCount >= queue.messageCount
  } catch (error) {
    throw formatError('aeHasAdequateCapacity', error)
  }
}

const getBenchmarkRepo = async ({ language, userId, repoUrl, skipped }) => {
  try {
    const where = {
      skipped,
      reportId: {
        [Op.is]: null
      }
    }

    if (language) {
      where.language = language
    }

    if (userId) {
      where.userId = userId
    }

    if (repoUrl) {
      where.repoUrl = repoUrl
    }

    const benchmarkRepos = await BenchmarkRepo.findAll({
      where,
      order: [
        ['id', 'ASC']
      ],
      limit: 1
    })

    if (benchmarkRepos.length === 0) {
      throw Error(`No BenchmarkRepo found for language: ${language}, userId: ${userId}, repoUrl: ${repoUrl}, skipped: ${skipped} + \n`)
    }

    return benchmarkRepos[0]
  } catch (error) {
    throw formatError('getBenchmarkRepo', error)
  }
}

const getRepoMetaFromGithub = async (repoUrl) => {
  const repoSlugMatches = repoUrl.match('http[s]*://[^/]+(/.+)')
  const repoSlug = repoSlugMatches[1]

  try {
    const response = await getFromGithubAPI(`repos${repoSlug}`)

    if (response.status !== 200) {
      throw Error(`Response status was ${response.status} for repoSlug: ${repoSlug}`)
    }

    return response.data
  } catch (error) {
    throw formatError('getRepoMetaFromGithub', error)
  }
}

const findOrCreateProjects = async (githubRepo, userId) => {
  try {
    // todo fix this because we no longer need to do this
    const eeProjectResults = await ProjectUtil.findOrCreateProjectInEE(githubRepo.git_url, githubRepo.name)

    if (!eeProjectResults[0].length) {
      throw Error(`No Enterprise Edition project found or created for git_url: ${githubRepo.git_url}`)
    }

    const eeProject = eeProjectResults[0][0]

    const results = await Project.findOrCreate({
      where: {
        gitUrl: githubRepo.git_url
      },
      defaults: {
        user: userId,
        url: githubRepo.url,
        gitUrl: githubRepo.git_url,
        name: githubRepo.name,
        eeProjectId: eeProject.id,
        nextProcessing: Time.getMidnight()
      }
    })

    if (!results.length) {
      throw Error(`No Community Edition project found or created for git_url: ${githubRepo.git_url}`)
    }

    return {
      projectId: results[0].get('id'),
      eeProjectId: eeProject.id
    }
  } catch (error) {
    throw formatError('findOrCreateProjects', error)
  }
}

const queueRepoForAnalysis = async (gitUrl, userId) => {
  try {
    return await analyze(gitUrl, userId, {})
  } catch (error) {
    throw formatError('findOrCreateProjects', error)
  }
}

const main = async (where) => {
  let benchmarkRepo

  try {
    const hasCapacity = await aeHasAdequateCapacity()

    if (!hasCapacity) {
      console.info('AE does not have enough available memory to run more benchmark analyses')
      process.exit()
    }

    benchmarkRepo = await getBenchmarkRepo(where)
    const githubRepo = await getRepoMetaFromGithub(benchmarkRepo.repoUrl)
    const stars = parseInt(githubRepo.stargazers_count)

    // The parent and source objects are present when the repository is a fork.
    // parent is the repository this repository was forked from,
    // source is the ultimate source for the network.
    if (_has(githubRepo, 'source')) {
      console.info('Repo is a fork, trying the next one')

      await benchmarkRepo.update({
        skipped: true,
        notes: 'Repo is a fork',
        stars
      })

      return await main(where)
    }

    const projectIds = await findOrCreateProjects(githubRepo, benchmarkRepo.userId)
    const reportId = await queueRepoForAnalysis(githubRepo.git_url, benchmarkRepo.userId)

    await benchmarkRepo.update({
      ...projectIds,
      reportId,
      stars
    })

    console.info('Successfully submitted benchmark repo for analysis: ', benchmarkRepo.repoUrl)
  } catch (error) {
    // This error isn't necessarily a huge problem, so if you see it in the logs, don't panic.
    // Maybe someone tried to run the script and we just didn't have the repo in our DB. No big deal.
    // But it could also be something like code breakage, or API keys that are no longer valid.
    console.error('BenchmarkRepo analysis threw an error: ', error)

    try {
      if (benchmarkRepo) {
        await benchmarkRepo.update({
          skipped: true,
          notes: error.message.substring(0, 254)
        })
      }
    } catch (benchmarkRepoError) {
      console.error('Could not update benchmarkRepo while catching error,', benchmarkRepoError)
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const timesPerMinute = 8

const manyMain = async () => {
  await aeHelper.connect()

  for (let i = 0; i < timesPerMinute; i++) {
    await main({
      language: null,
      userId: null,
      repoUrl: null,
      skipped: false
    })

    await sleep(60000 / timesPerMinute)
  }

  process.exit()
}

manyMain()
