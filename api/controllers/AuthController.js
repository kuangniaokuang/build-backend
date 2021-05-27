const passport = require('passport')
const jwt = require('jsonwebtoken')

const userUtil = require('../util/user')
const { User } = require('../../db/models')
const { githubHandler, gitlabHandler } = require('../util/auth')
const config = require('../../config/env/resolveConfig')

const redirectToLogin = async (user, res) => {
  const token = module.exports.generateTokenFromUser(user)
  await userUtil.trackUserLogin(user)

  return res.redirect(`${config.custom.frontendBaseUrl}/login?token=${token}`)
}

module.exports = {
  getTokenByEmail: async (req, res) => {
    if (
      process.env.NODE_ENV !== 'testing' ||
      !req.query.email
    ) {
      return res.status(404).send()
    }

    try {
      const userEmail = req.query.email
      const user = await userUtil.findOneByEmail(userEmail)
      const token = module.exports.generateTokenFromUser(user.dataValues)

      return res.status(200).send({ token })
    } catch (err) {
      console.error(err)
      return res.status(500).send('ERROR: AuthController.js:getTokenByEmail', err)
    }
  },
  authGithub: (req, res) => {
    // https://docs.github.com/en/free-pro-team@latest/developers/apps/scopes-for-oauth-apps
    passport.authorize('github', {
      scope: ['user:email', 'public_repo'],
      accessType: 'offline',
      approvalPrompt: 'force',
      state: JSON.stringify({
        isLogin: req.query.login
      })
    })(req, res)
  },
  // This is broken out to accomodate integration testing
  processGithubAuthSecure: async (req, res) => {
    if (process.env.NODE_ENV === 'testing') {
      module.exports.processGithubAuth(req, res)
    } else {
      res.status(404).send()
    }
  },
  processGithubAuth: async (req, res) => {
    const userFromGithub = req.user
    const state = req.query.state || null

    try {
      const preservedState = JSON.parse(state)
      const userToCreate = {
        photo: userFromGithub.photos[0] ? userFromGithub.photos[0].value : '',
        displayName: userFromGithub.displayName,
        githubUsername: userFromGithub.username,
        githubApiUrl: userFromGithub._json.url,
        githubAccessToken: userFromGithub.githubAccessToken,
        githubRefreshToken: userFromGithub.githubRefreshToken
      }

      // find existing user with githubUsername
      const ceUser = await User.findOne({
        where: {
          githubUsername: userFromGithub.username
        }
      })

      // inexistent user trying to login
      if (!ceUser && preservedState.isLogin) {
        return res.redirect(`${config.custom.frontendBaseUrl}/onboarding/github`)
      }

      const user = ceUser
        ? await githubHandler.handleUserExists(userFromGithub, ceUser)
        : await githubHandler.handleUserDoesNotExist(userFromGithub, userToCreate)

      await redirectToLogin(user, res)
    } catch (error) {
      console.log('ERROR: Github Auth Error: ', error.message)
    }
  },
  authGithubCallback: async (req, res, next) => {
    await passport.authorize('github',
      async (err, user) => {
        if (err) {
          sails.log.error(err)
        }
        req.user = user
        await module.exports.processGithubAuth(req, res)
      })(req, res, next)
  },
  authGitlab: async (req, res) => {
    await passport.authorize('gitlab', {
      scope: 'api read_api',
      state: JSON.stringify({
        isLogin: req.query.login
      })
    })(req, res)
  },
  authGitlabCallback: async (req, res, next) => {
    await passport.authorize('gitlab',
      async (err, userFromGitlab) => {
        if (err) {
          sails.log.error(err)
        }
        req.user = userFromGitlab
        await module.exports.processGitlabAuth(req, res)
      })(req, res, next)
  },
  async processGitlabAuth (req, res) {
    // This is so we can use the same backend on several front ends
    const redirectBaseUrl = req.query.redirectBaseUrl || config.custom.frontendBaseUrl
    const state = req.query.state || null
    const userFromGitlab = req.user

    try {
      // find existing user with gitlabUsername
      const foundUser = await User.findOne({
        where: {
          gitlabUsername: userFromGitlab.username
        }
      })
      const preservedState = JSON.parse(state)

      // nonexistent user trying to login
      if (!foundUser && preservedState.isLogin) {
        return res.redirect(`${redirectBaseUrl}/onboarding/gitlab`)
      }

      const user = foundUser
        ? await gitlabHandler.handleUserExists(userFromGitlab, foundUser)
        : await gitlabHandler.handleUserDoesNotExist(userFromGitlab)

      await redirectToLogin(user, res)
    } catch (error) {
      sails.log.error('Gitlab Auth Error: ', error.message, error.documentation_url, error.options)
    }
  },
  generateTokenFromUser (user) {
    if (!user) {
      throw new Error('generateTokenFromUser: user was undefined')
    }
    // This is needed since this handles github and gitlab users
    user = user[0] ? user[0].dataValues : user

    // if the user object has the same properties but in a different order,
    // we get a different key. Let's make it consistent.
    const orderedUser = Object.keys(user).sort().reduce(
      (obj, key) => {
        obj[key] = user[key]
        return obj
      },
      {}
    )

    return jwt.sign(orderedUser, config.custom.ENCRYPTION_KEY)
  }
}
