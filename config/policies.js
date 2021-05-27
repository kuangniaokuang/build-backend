/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const isAuthorized = require('../api/policies/isAuthorized')
const AUTH_POLICY = (req, res, next) => isAuthorized(req, res, next)

module.exports.policies = {
  '*': process.env.NODE_ENV === 'test' ? true : AUTH_POLICY,
  AuthController: {
    '*': true
  },
  TestController: {
    '*': true
  },
  EmailController: {
    send: true,
    sendVerificationEmail: true,
    verifyEmailVerificationCode: true
  },
  BadgeController: {
    badge: true
  },
  PublicProfileController: {
    getUserProfile: true,
    publicProfileSearch: true
  },
  ProjectController: {
    publicProfile: true
  },
  ContributorsController: {
    profile: true,
    topRepositories: true,
    progress: true,
    badges: true
  }
}
