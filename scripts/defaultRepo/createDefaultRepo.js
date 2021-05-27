const { createRepo } = require('./utils')

const config = require('../../config/env/resolveConfig')

const sourceRepoUrl = 'https://github.com/axios/axios'
const sourceRepoDir = 'source-repo'
const exampleRepoName = 'example-repository'
const exampleCommiterName = 'Example Committer'
const exampleCommitterEmail = 'example-committer@merico.dev'
const numberOfOtherDevs = 4
const maxCommits = 627
const defaultCommitterPercentage = 40
const githubRepoUrl = `https://merico-dev:${config.custom.githubPersonalAccessToken}@github.com/merico-dev/example-repository.git`
const gitlabRepoUrl = `https://gitlab-ci-token:${config.custom.gitlabPersonalAccessToken}@gitlab.com/merico-dev/ce/example-repository.git`

const main = async () => {
  await createRepo(
    sourceRepoUrl,
    sourceRepoDir,
    exampleRepoName,
    exampleCommiterName,
    exampleCommitterEmail,
    numberOfOtherDevs,
    maxCommits,
    defaultCommitterPercentage,
    githubRepoUrl,
    gitlabRepoUrl
  )

  process.exit()
}

main()
