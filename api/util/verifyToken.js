const jwt = require('jsonwebtoken')

const { User, UserEmail } = require('../../db/models')
const config = require('../../config/env/resolveConfig')

module.exports = {
  getUserFromToken: async function (req, res, callback) {
    if (req.header('authorization') || (req.body && req.body.token)) {
      // if one exists, attempt to get the header data
      let token = ''
      if (req.header('authorization') && req.header('authorization').match(/Bearer/)) {
        token = req.header('authorization').split('Bearer ')[1]
      } else if (req.body && req.body.token) {
        token = req.body.token
      } else {
        token = req.header('authorization')
      }

      // if there's nothing after "Bearer", no go
      if (!token) {
        return callback(new Error('ERROR: JDUD83: no token found'))
      }
      let payload
      try {
        payload = jwt.verify(token, config.custom.ENCRYPTION_KEY)
        if (!payload) {
          return callback(new Error('UserNotFoundFromJWT'))
        }
      } catch (err) {
        if (err) {
          return callback(new Error('ERROR: jwt check failed'))
        }
      }

      // if there is something, attempt to parse it as a JWT token
      User.findOne({
        where: {
          primaryEmail: payload.primaryEmail || 'unknown',
          gitlabUsername: payload.gitlabUsername,
          githubUsername: payload.githubUsername
        },
        include: [{
          model: UserEmail
        }]
      })
        .then((foundUser) => {
          if (!foundUser || foundUser === {}) {
            return callback(new Error('ERROR: sdf22: no user found, token was decoded successfully'), null)
          }
          return callback(null, foundUser)
        })
        .catch(err => {
          console.error(err)
          return callback(err, null)
        })
    } else {
      // if neither a cookie nor auth header are present, then there was no attempt to authenticate
      return callback(new Error('ERROR: ksdid: no authorization passed in'))
    }
  }
}
