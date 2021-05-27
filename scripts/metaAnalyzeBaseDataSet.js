const neatCsv = require('neat-csv')
const fs = require('fs')
const path = require('path')
const util = require('util')
const axios = require('axios')
const _has = require('lodash/has')
const userUtil = require('../api/util/user')
const { BaselineRepoMeta } = require('../db/models')
const { GITHUB_PATS } = require('../config/env/resolveConfig').custom

const CSV_DIR = 'base-dataset-csvs'
const CONTRIBUTOR_STATS_TIMEOUT = 60

// TODO: make this into a cli tool
const errorLogFile = fs.createWriteStream(path.join(__dirname, '/error.log'), { flags: 'a' })

const createUser = async (login, email, requestOptions) => {
  try {
    console.log('createUser: ', login)
    const userGithubApiUrl = `https://api.github.com/users/${login}`
    const userApiResponse = await axios.get(userGithubApiUrl, requestOptions)
    const userGitHubData = userApiResponse.data
    // console.log('userGitHubData', userGitHubData)

    const users = await userUtil.findOrCreateUser({
      displayName: userGitHubData.name,
      primaryEmail: email,
      githubUsername: login,
      githubApiUrl: userGithubApiUrl,
      photo: userGitHubData.avatar_url,
      isBaseDataSet: true
    }, {
      githubUsername: login
    })

    return users && users.length
      ? users[0]
      : null
  } catch (error) {
    errorLogFile.write(
      util.format(`createUser error: ${login}, ${email}, ${error.message}) + \n`)
    )
    console.log('Failed to create user: ', error)
    throw error
  }
}

const getBaseRepoData = async (login, repoSlug, requestOptions) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${login}/${repoSlug}`,
      requestOptions
    )

    if (response.status !== 200) {
      throw Error('Response was: ', response.status)
    }

    return response.data
  } catch (error) {
    errorLogFile.write(
      util.format(`getBaseRepoData: ${login}, ${repoSlug}, ${error.message}) + \n`)
    )
    console.log('Failed to getBaseRepoData', error)
    throw error
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getAllContributorStats = async (login, repoSlug, requestOptions, duration = 0) => {
  try {
    const result = await axios.get(
      `https://api.github.com/repos/${login}/${repoSlug}/stats/contributors`,
      requestOptions
    )

    if (duration > CONTRIBUTOR_STATS_TIMEOUT) {
      errorLogFile.write(
        util.format(`contributorAnalyticsTimeouts: ${login}, ${repoSlug} + \n`)
      )

      return []
    }

    if (parseInt(result.status) === 202) {
      console.log('sleeping... duration: ', duration)
      await sleep(3000)

      return await getAllContributorStats(login, repoSlug, requestOptions, duration + 3)
    }

    return result.data
  } catch (error) {
    errorLogFile.write(
      util.format(`getAllContributorStats: ${login}, ${repoSlug}, ${error.message}) + \n`)
    )
    console.log('we had a real error here', error)
  }
}

const calculateCommitMetrics = (allContributorStats, login) => {
  let totalCommits = 0
  let userCommits = 0
  let totalCommitters = 0

  allContributorStats.forEach(contributorStats => {
    if (contributorStats.author.login === login) {
      userCommits = contributorStats.total
    }

    totalCommits += contributorStats.total
    totalCommitters++
  })

  return {
    totalCommits,
    userCommits,
    totalCommitters
  }
}

const importCSV = async (csvString, language, start, end) => {
  const userRows = await neatCsv(csvString)
  /**
   * REMOVE THE SLICE TO IMPORT ALL USERS
   */
  // const tempUserRows = userRows.slice(0, 7)

  for (let i = 0; i < userRows.length; i++) {
    const userRow = userRows[i]
    try {
      const { login, email } = userRow
      const patIndex = i % 4
      const requestOptions = {
        headers: {
          Authorization: `token ${GITHUB_PATS[patIndex]}`,
          'User-Agent': 'Request-Promise'
        }
      }

      const user = await createUser(login, email, requestOptions)
      if (!user) {
        throw Error('No user found or created for', login, email)
      }
      // console.log('user', user)

      /// //////////////////////////////////////////////
      /// ////////////// METANALYSIS ///////////////////
      /// //////////////////////////////////////////////

      /**
       * CHANGE THIS NUMBER HERE, I'VE MADE IT 3 JUST FOR TESTING PURPOSES
       */
      for (let j = start; j < end; j++) {
        try {
          console.log('/////////////////////////')
          console.log('/////// Starting ////////')
          console.log('/////////////////////////')

          const repoUrl = userRow[`repository-${j}`]
          if (!repoUrl) {
            continue
          }

          const repoSlugMatches = repoUrl.match('([^/]+$)')

          const metaData = await BaselineRepoMeta.findOne({
            where: {
              user: user.getDataValue('id'),
              gitUrl: repoUrl,
              email
            }
          })

          if (metaData instanceof BaselineRepoMeta) {
            console.log('already meta analyzed repo for login: ', repoUrl, login)
            continue
          }

          console.log('Analyze Repo: ', repoUrl)

          if (repoSlugMatches && repoSlugMatches.length > 1) {
            const repoSlug = repoSlugMatches[1]

            const repoAnalysis = await getBaseRepoData(login, repoSlug, requestOptions)
            // console.log('repoAnalysis', repoAnalysis)

            const allContributorStats = await getAllContributorStats(login, repoSlug, requestOptions)
            // console.log('allContributorStats', allContributorStats)

            if (!allContributorStats || allContributorStats.length < 1) {
              errorLogFile.write(
                util.format(`allContributorStats empty: ${login}, ${repoSlug}) + \n`)
              )

              continue
            }

            const { userCommits, totalCommits, totalCommitters } = calculateCommitMetrics(allContributorStats, login)

            // The parent and source objects are present when the repository is a fork.
            // parent is the repository this repository was forked from,
            // source is the ultimate source for the network.
            const forked = _has(repoAnalysis, 'source')

            try {
              await BaselineRepoMeta.findOrCreate({
                where: {
                  user: user.getDataValue('id'),
                  gitUrl: repoUrl,
                  email
                },
                defaults: {
                  user: user.getDataValue('id'),
                  gitUrl: repoUrl,
                  repoSize: repoAnalysis.size,
                  email,
                  userCommits,
                  totalCommits,
                  totalCommitters,
                  forked,
                  language
                }
              })
              // console.log('baselineRepoMeta', baselineRepoMeta)
            } catch (error) {
              errorLogFile.write(
                util.format(`baselineRepoMetaFailures: ${login}, ${repoSlug}, ${error.message}) + \n`)
              )
              console.log('failed to create baselineRepoMeta', error)
              throw error
            }
          }
        } catch (error) {
          errorLogFile.write(
            util.format(`Failed to metanalyze a repo: ${login}, ${error.message}) + \n`)
          )
          console.log('Failed to metanalyze a repo', error)
        }
      }
    } catch (error) {
      errorLogFile.write(
        util.format(`Big error: ${error.message}) + \n`)
      )
      console.log('we had an error, but lets keep going', error)
    }
  }
}

const main = async (spreadsheetName, language) => {
  const csvData = fs.readFileSync(path.join(__dirname, CSV_DIR, `${spreadsheetName}.csv`), 'utf8')
  importCSV(csvData, language, 0, 31)
}

main('ruby', 'ruby')
