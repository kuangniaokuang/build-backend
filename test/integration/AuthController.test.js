const sinon = require('sinon')
const chai = require("chai");
const { expect } = chai
const sinonChai = require("sinon-chai")
const passport = require('passport')
const {
  mockRequest,
  mockResponse
} = require('mock-req-res')
const { LoginAttempt } = require('../../db/models')

const githubUtil = require('../../api/util/github')
const Encryption = require('../../api/util/encryption')
const config = require('../../config/env/resolveConfig')
const AuthController = require('../../api/controllers/AuthController')
const Factory = require('../factory')
const helpers = require('../util/helpers')
const mockObjects = require('../util/mockObjects')
const badgeImageGenerator = require('../../api/util/badges/badgeImageGenerator')

chai.use(sinonChai);

describe('AuthController', () => {
  const mockUser = mockObjects.responses.user

  beforeEach(() => {
    sinon.stub(badgeImageGenerator, 'create').returns('ANY')
    sinon.stub(badgeImageGenerator, 'upload').returns('ANY')
  })

  afterEach(async () => {
    sinon.restore();
    await Factory.destroyAll()
  })

  describe('Github', () => {
    describe('authGithubCallback()', () => {
      beforeEach(async () => {
        sinon.stub(passport, 'authorize').returns(async (req, res) => {
          req.user = mockUser

          return await AuthController.processGithubAuth(req, res)
        })
        sinon.stub(githubUtil, 'getEmails').returns([{email: 'jon@foo.com'}])
      })

      it('should redirect to onboarding', async () => {
        const req = mockRequest({
          query: {
            state: "{\"isLogin\":true}"
          }
        })
        const res = mockResponse()

        await AuthController.authGithubCallback(req, res)

        expect(res.redirect).to.have.been.calledWith(
          `${config.custom.frontendBaseUrl}/onboarding/github`
        )
      })

      it('should redirect existing users to /login with a token in the params', async () => {
        const req = mockRequest({
          query: {
            state: "{}"
          }
        })
        const res = mockResponse()

        let user = await Factory.createUser({
          ...mockObjects.db.user.create.github,
          primaryEmail: 'jon@foo.com',
        })

        await AuthController.authGithubCallback(req, res)

        await user.reload()

        let loginAttempts = await LoginAttempt.findOne({where: {UserId: user.id}})
        expect(loginAttempts.dataValues).not.equal(undefined)

        const token = AuthController.generateTokenFromUser(user.dataValues)

        expect(res.redirect).to.have.been.calledWith(
          `${config.custom.frontendBaseUrl}/login?token=${token}`
        )
      })

      it ('should create a user if one does not exist and redirect to /login with a token in the params', async () => {
        const req = mockRequest({
          query: {
            state: "{}"
          }
        })
        const res = mockResponse()

        await AuthController.authGithubCallback(req, res)
        const latestUser = await helpers.findLastCreatedUser()

        Factory.createdStuff.users.push(latestUser)

        const token = AuthController.generateTokenFromUser(latestUser.dataValues)

        expect(res.redirect).to.have.been.calledWith(
          `${config.custom.frontendBaseUrl}/login?token=${token}`
        )

        const gotStartedBadge = await helpers.findBadge({
          user: latestUser.get('id'),
          name: 'Got Started'
        })

        expect(gotStartedBadge.get('name')).to.equal('Got Started')
      })
    })

    describe('processGithubAuthSecure', () => {
      const env = Object.assign({}, process.env)

      afterEach(() => {
        process.env = env;
      })

      it ('returns 404 if the env is not testing', async () => {
        process.env.NODE_ENV = 'production'

        const req = mockRequest({
          query: {
            email: 'some.email@test.com'
          }
        })
        const res = mockResponse()

        await AuthController.processGithubAuthSecure(req, res)

        expect(res.status).to.have.been.calledWith(404)
      })
    })
  })

  describe('Gitlab', () => {
    describe('authGitlab', () => {
      it('calls passport.authorize with gitlab', async () => {
        sinon.stub(passport, 'authorize').returns(() => {})

        const req = mockRequest()
        const res = mockResponse()

        await AuthController.authGitlab(req, res)

        expect(passport.authorize).to.have.been.calledOnce
        expect(passport.authorize.args[0][0]).to.equal('gitlab')
        expect(passport.authorize.args[0][1].scope).to.equal('api read_api')
      })
    })

    describe('authGitlabCallback', () => {
      beforeEach(async () => {
        sinon.stub(passport, 'authorize').returns(async (req, res) => {
          req.user = {
            ...mockObjects.responses.gitlabUser,
            emails: [{ value: 'jon@foo.com' }]
          }
          return await AuthController.processGitlabAuth(req, res)
        })
      })

      it('should redirect to onboarding', async () => {
        const req = mockRequest({
          query: {
            state: "{\"isLogin\":true}"
          }
        })
        const res = mockResponse()

        await AuthController.authGithubCallback(req, res)

        expect(res.redirect).to.have.been.calledWith(
          `${config.custom.frontendBaseUrl}/onboarding/gitlab`
        )
      })

      it('should redirect existing users to /login with a token in the params', async () => {
        const req = mockRequest({
          query: {
            state: "{}"
          }
        })
        const res = mockResponse()

        let user = await Factory.createUser({
          ...mockObjects.db.user.create.gitlab,
          gitlabAccessToken: 'bacontomato',
          gitlabRefreshToken: 'sandwich',
          primaryEmail: 'jon@foo.com',
        })

        await AuthController.authGitlabCallback(req, res)

        await user.reload({
          attributes: {
            include: ['gitlabAccessToken', 'gitlabRefreshToken']
          }
        })

        expect(Encryption.decrypt(user.get('gitlabAccessToken'))).to.equal('f437hf3f834gf8w34g')

        await user.reload()

        const token = AuthController.generateTokenFromUser(user.dataValues)

        expect(res.redirect).to.have.been.calledWith(
          `${config.custom.frontendBaseUrl}/login?token=${token}`
        )
      })

      it('should create a user if one does not exist and redirect to /login with a token in the params', async () => {
        const req = mockRequest({
          query: {
            state: "{}"
          }
        })
        const res = mockResponse()

        await AuthController.authGitlabCallback(req, res)
        const latestUser = await helpers.findLastCreatedUser()

        Factory.createdStuff.users.push(latestUser)

        const token = AuthController.generateTokenFromUser(latestUser.dataValues)

        expect(res.redirect).to.have.been.calledWith(
          `${config.custom.frontendBaseUrl}/login?token=${token}`
        )
      })

      it ('should create a user and delete the contributor', async () => {
        const newContributor = await Factory.createContributor()
        expect(newContributor).to.not.be.null

        passport.authorize.restore()
        sinon.stub(passport, 'authorize').returns(async (req, res) => {
          req.user = {
            ...mockUser,
            emails: [{
              value: newContributor.get('email')
            }]
          }

          return await AuthController.processGitlabAuth(req, res)
        })

        const req = mockRequest({
          query: {
            state: "{}"
          }
        })
        const res = mockResponse()

        await AuthController.authGitlabCallback(req, res)
        const latestUser = await helpers.findLastCreatedUser()

        Factory.createdStuff.users.push(latestUser)
        expect(latestUser.get('primaryEmail')).to.equal(newContributor.get('email'))

        const contributor = await helpers.findContributorByEmail(newContributor.get('email'))
        expect(contributor).to.be.null
      })
    })
  })

  describe('#getTokenByEmail()', () => {
    const env = Object.assign({}, process.env)

    // TODO: This must be changed to the seed email
    const testingEmail = "lucaskauz@gmail.com"

    afterEach(() => {
      process.env = env;
    })

    it('should return 404 if it\'s not in an e2e testing environment', async () => {
      process.env.NODE_ENV = 'production'
      const req = mockRequest({
        query: {
          email: testingEmail
        }
      })
      const res = mockResponse()
      await AuthController.getTokenByEmail(req, res)
      expect(res.status).to.have.been.calledWith(404)
    })
  })
})
