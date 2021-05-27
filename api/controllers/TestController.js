const { User } = require('../../db/models')
const packageJson = require('../../package.json')

module.exports = {
  healthCheck: (req, res) => {
    return res.status(200).send({ status: 'ok' })
  },
  ping: (req, res) => {
    return res.status(200).send({ pong: 123 })
  },
  version: async (req, res) => {
    const userCount = await User.count({
      distinct: true
    })

    const revision = require('child_process')
      .execSync('git rev-parse HEAD')
      .toString().trim()

    const commitDetails = require('child_process')
      .execSync('git log -1')
      .toString().trim()

    return res.status(200).send({ userCount, latestCommit: revision, version: packageJson.version, commitDetails, env: process.env.NODE_ENV })
  }
}
