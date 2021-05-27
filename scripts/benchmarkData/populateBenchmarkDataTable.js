const neatCsv = require('neat-csv')
const path = require('path')
const fs = require('fs')

const userUtil = require('../../api/util/user')
const { BenchmarkRepo } = require('../../db/models')
const { getFromGithubAPI } = require('./common')

const CSV_DIR = 'base-dataset-csvs'

const formatError = (funcName, error) => {
  error.message = `populateBenchmarkDataTable.js:${funcName} -> ${error.message}`

  return error
}

const findOrCreateUser = async (login, email) => {
  try {
    if (!login || !email) {
      console.log(`No login: ${login} or no email: ${email}`)
      return
    }

    console.log('findOrCreateUser: ', login)

    const githubUserApiUrl = `users/${login}`
    const response = await getFromGithubAPI(githubUserApiUrl)

    if (response.status !== 200) {
      throw Error(`Response status was ${response.status} for login: ${login}`, response)
    }

    const githubUser = response.data

    const users = await userUtil.findOrCreateUser({
      displayName: githubUser.name,
      primaryEmail: 'benchmarkuser@merico.dev',
      githubUsername: login,
      githubApiUrl: githubUserApiUrl,
      photo: githubUser.avatar_url
    }, {
      githubUsername: login
    })

    if (!users || !users.length) {
      throw Error(`No user found or created for login: ${login} and email: ${email}`)
    }

    const user = users[0]
    await userUtil.addEmailsToUser(user, [{ email }])

    return user
  } catch (error) {
    throw formatError('findOrCreateUser', error)
  }
}

const findOrCreateBenchmarkRepo = async (repoUrl, language, userId) => {
  try {
    const [benchmarkRepo] = await BenchmarkRepo.findOrCreate({
      defaults: {
        repoUrl,
        language,
        userId: userId
      },
      where: {
        userId: userId,
        repoUrl: repoUrl
      }
    })

    if (!benchmarkRepo) {
      throw Error(`Could not create or find benchmark repo for userId: ${userId} and repoUrl: ${repoUrl}`)
    }

    return benchmarkRepo
  } catch (error) {
    throw formatError('findOrCreateBenchmarkRepo', error)
  }
}

const importCSV = async (csvString, language) => {
  const userRows = await neatCsv(csvString)

  for (let i = 0; i < userRows.length; i++) {
    try {
      const userRow = userRows[i]
      const { login, email } = userRow
      const user = await findOrCreateUser(login, email)

      for (let j = 0; j < 31; j++) {
        const repoUrl = userRow[`repository-${j}`]

        if (!repoUrl) {
          continue
        }

        await findOrCreateBenchmarkRepo(repoUrl, language, user.id)

        console.log('Added repo: ', repoUrl)
      }
    } catch (error) {
      console.error('Populating the benchmark data table generated this: ', error)
      continue
    }
  }
}

const spreadSheets = [
  {
    filename: 'Javascript.csv',
    language: 'javascript'
  },
  {
    filename: 'python.csv',
    language: 'python'
  },
  {
    filename: 'ruby.csv',
    language: 'ruby'
  },
  {
    filename: 'Java.csv',
    language: 'java'
  },
  {
    filename: 'TS.csv',
    language: 'typescript'
  },
  {
    filename: 'Go.csv',
    language: 'go'
  },
  {
    filename: 'C.csv',
    language: 'C'
  },
  {
    filename: 'Cpp.csv',
    language: 'C++'
  }
]

const main = async () => {
  for (let i = 0; i < spreadSheets.length; i++) {
    const { filename, language } = spreadSheets[i]
    const csvData = fs.readFileSync(path.join(__dirname, CSV_DIR, filename), 'utf8')

    await importCSV(csvData, language)
  }

  process.exit()
}

main()
