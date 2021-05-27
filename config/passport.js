const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy
const GitLabStrategy = require('passport-gitlab2').Strategy
const config = require('../config/env/resolveConfig')

passport.use(new GitHubStrategy({
  clientID: config.custom.githubAuth.clientId,
  clientSecret: config.custom.githubAuth.clientSecret,
  callbackURL: config.custom.githubAuth.callbackUrl
},
(accessToken, refreshToken, params, profile, cb) => {
  profile.githubAccessToken = accessToken
  profile.githubRefreshToken = refreshToken
  return cb(null, profile)
}
))

passport.use(new GitLabStrategy({
  clientID: config.custom.gitlabAuth.clientId,
  clientSecret: config.custom.gitlabAuth.clientSecret,
  callbackURL: config.custom.gitlabAuth.callbackUrl
},
(accessToken, refreshToken, profile, cb) => {
  profile.gitlabAccessToken = accessToken
  profile.gitlabRefreshToken = refreshToken
  return cb(null, profile)
}
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  cb(null, id)
})
