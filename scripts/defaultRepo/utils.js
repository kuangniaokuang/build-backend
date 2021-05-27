const simpleGit = require('simple-git')
const rimraf = require('rimraf')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const faker = require('faker')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const git = simpleGit()

module.exports = {
  async createRepo (
    sourceRepoUrl,
    sourceRepoDir,
    destRepoDir,
    defaultCommitterName,
    defaultCommitterEmail,
    otherDevs,
    maxCommits,
    defaultCommitterPercentage,
    githubRepoUrl,
    gitlabRepoUrl
  ) {
    try {
      const sourceRepo = await module.exports.initializeSourceRepo(sourceRepoUrl, sourceRepoDir)
      const commits = await module.exports.getCommits(sourceRepo)
      const commitLimit = module.exports.getCommitLimit(commits.length, maxCommits)
      const destRepo = await module.exports.initDestRepo(destRepoDir, defaultCommitterName, defaultCommitterEmail)
      const commitDates = module.exports.generateDatesForCommits(commitLimit)
      const otherCommitters = module.exports.createFakeCommitters(otherDevs)

      await module.exports.writeCommits(commits, commitDates, sourceRepo, sourceRepoDir, destRepo, destRepoDir, defaultCommitterName, defaultCommitterEmail, otherCommitters, commitLimit, defaultCommitterPercentage)
      await module.exports.pushToRemote(destRepo, githubRepoUrl, gitlabRepoUrl)

      rimraf.sync(sourceRepoDir)
      console.log('Deleted source repo')

      rimraf.sync(destRepoDir)
      console.log('Deleted destination repo')

      console.log('Finished creating repo')
    } catch (e) {
      console.error('createDefaultRepo failure', e)
    }
  },

  async initializeSourceRepo (sourceRepoUrl, sourceRepoDir) {
    console.log('Initializing source repo')

    const cloneRepo = async (sourceRepoUrl, directory) => {
      return await git.clone(sourceRepoUrl, directory)
    }

    try {
      await cloneRepo(sourceRepoUrl, sourceRepoDir)
    } catch (e) {
      if (!e.message.includes('destination path \'source-repo\' already exists and is not an empty directory')) {
        throw e
      }
    }

    const sourceRepo = simpleGit(sourceRepoDir)
    await sourceRepo.checkout('master')

    return sourceRepo
  },

  async getCommits (repo) {
    const commitLog = await repo.log()
    return commitLog.all.reverse()
  },

  getCommitLimit (commits, maxCommits) {
    return commits > maxCommits
      ? maxCommits
      : commits
  },

  async initDestRepo (directory, committerName, committerEmail) {
    console.log('Initializing destination repo')

    await git.init([directory])
    const destRepoGit = simpleGit(directory)

    destRepoGit.addConfig('user.name', committerName)
    destRepoGit.addConfig('user.email', committerEmail)

    return destRepoGit
  },

  generateDatesForCommits (commitCount) {
    console.log('Generating commit dates')

    const createEarlierDate = (date) => {
      const fourHoursInMilliseconds = 1000 * 60 * 60 * 4
      const fourDaysInMilliseconds = 1000 * 60 * 60 * 24 * 4
      const intervalInMilliseconds = Math.floor(Math.random() * (fourDaysInMilliseconds - fourHoursInMilliseconds)) + fourHoursInMilliseconds

      return new Date(date.valueOf() - intervalInMilliseconds)
    }

    const dates = []

    for (let i = 0; i < commitCount; i++) {
      const lastDate = i ? dates[i - 1] : Date.now()

      dates.push(createEarlierDate(lastDate))
    }

    return dates.reverse()
  },

  createFakeCommitters (amount) {
    console.log('Creating fake committers')

    const committers = []

    for (let i = 0; i < amount; i++) {
      committers.push({
        committerName: faker.name.findName(),
        committerEmail: faker.internet.email()
      })
    }

    return committers
  },

  async writeCommits (
    commits,
    dates,
    sourceRepo,
    sourceRepoDir,
    destRepo,
    destRepoDir,
    defaultCommitterName,
    defaultCommitterEmail,
    otherCommitters,
    commitLimit,
    defaultCommitterPercentage
  ) {
    console.log('Writing commits...')

    const getCommitter = (defaultCommitterName, defaultCommitterEmail, otherCommitters, commitLimit, commitIndex, maxCommitters) => {
      // this useDefaultCommitter boolean is confusing, but it's basically saying
      // if we're within the first three commits, then definitely use the default committer,
      // otherwise use the normal probability for the default committer
      const useDefaultCommitter = commitIndex >= (commitLimit - 3)
        ? true
        : (Math.floor(Math.random() * 100) + 1) <= defaultCommitterPercentage

      return useDefaultCommitter
        ? {
            committerName: defaultCommitterName,
            committerEmail: defaultCommitterEmail
          }
        : otherCommitters[Math.floor(Math.random() * maxCommitters)]
    }

    const copyCommit = async (
      commit,
      commitDate,
      sourceDir,
      sourceRepo,
      destDir,
      destRepo,
      committerName,
      committerEmail,
      copiedCount
    ) => {
      if (copiedCount % 10 === 0) {
        console.log(`${copiedCount} commits copied. Copying commit... ${commit.hash}`)
      }

      const removeFilesFromRepoDir = async (directory) => {
        const files = fs.readdirSync(directory)
        for (let j = 0; j < files.length; j++) {
          const file = files[j]

          if (file === '.git') { continue }

          const destFilePath = path.join(directory, file)

          fse.removeSync(destFilePath)
        }
      }

      const copyTree = async (sourceDir, destDir) => {
        const sourceFiles = fs.readdirSync(sourceDir)

        for (let k = 0; k < sourceFiles.length; k++) {
          const sourceFile = sourceFiles[k]

          if (sourceFile === '.git') { continue }

          const sourceFilePath = path.join(sourceDir, sourceFile)
          const destFilePath = path.join(destDir, sourceFile)

          fse.copySync(sourceFilePath, destFilePath)
        }
      }

      if (commit.message.startsWith('Merge')) {
        return
      }

      const commitHash = commit.hash

      await removeFilesFromRepoDir(destDir)

      await sourceRepo.checkout(commitHash)

      await copyTree(sourceDir, destDir)

      await destRepo.add('.')

      try {
        await exec(`export GIT_COMMITTER_DATE="${commitDate}" && git commit -m "${commit.message.replace(/"/g, '')}" --date "${commitDate}" --author "${committerName} <${committerEmail}>"`, {
          cwd: 'example-repository'
        })
      } catch (e) {
        console.info('Commit', commit)

        console.error(e)
      }
    }

    const maxCommittersPerMonth = {}

    const getCommitterLimitForDate = (date, totalCommitters) => {
      const yearMonth = `${date.getYear()}_${date.getMonth()}`

      if (!(yearMonth in maxCommittersPerMonth)) {
        maxCommittersPerMonth[yearMonth] = Math.ceil(Math.random() * totalCommitters)
      }

      return maxCommittersPerMonth[yearMonth]
    }

    await copyCommit(commits[0], dates[0].toISOString(), sourceRepoDir, sourceRepo, destRepoDir, destRepo, defaultCommitterName, defaultCommitterEmail, 0)

    for (let i = 1; i < commitLimit; i++) {
      const maxCommittersForDate = getCommitterLimitForDate(dates[i], otherCommitters.length)

      const { committerName, committerEmail } = getCommitter(defaultCommitterName, defaultCommitterEmail, otherCommitters, commitLimit, i, maxCommittersForDate)

      await copyCommit(commits[i], dates[i].toISOString(), sourceRepoDir, sourceRepo, destRepoDir, destRepo, committerName, committerEmail, i)
    }

    console.log('Finished writing commits')
  },

  async pushToRemote (repo, githubRepoUrl, gitlabRepoUrl) {
    console.log('Pushing to remote...')

    const pushToGithub = async (repo) => {
      console.log('Pushing to Github')

      await repo.addRemote('origin', githubRepoUrl)
      await repo.push(['-u', '-f', 'origin', 'master'])
      await repo.removeRemote('origin')

      console.log('Finished pushing to Github')
    }

    const pushToGitlab = async (repo) => {
      console.log('Pushing to Gitlab')

      await repo.addRemote('origin', gitlabRepoUrl)
      await repo.push(['-u', '-f', 'origin', 'master'])
      await repo.removeRemote('origin')

      console.log('Finished pushing to Gitlab')
    }

    try {
      await pushToGithub(repo)
    } catch (e) {
      console.error('Failed to push to Github', e)
    }

    try {
      await pushToGitlab(repo)
    } catch (e) {
      console.error('Failed to push to Gitlab', e)
    }

    console.log('Finished pushing to remote')
  }
}
