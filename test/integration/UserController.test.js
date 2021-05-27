const sinon = require('sinon')
const chai = require("chai");
const { expect } = chai
const sinonChai = require("sinon-chai");
const passport = require('passport')
const {
  mockRequest,
  mockResponse
} = require('mock-req-res')

const githubUtil = require('../../api/util/github')
const UserController = require('../../api/controllers/UserController')
const Factory = require('../factory')
const Helper = require('../util/helpers')

chai.use(sinonChai);
let mockUser

describe('UserController', () => {
  beforeEach(async () => {
    let {user} = await Factory.createUserWithProject()
    mockUser = user
    sinon.stub(passport, 'authorize').returns(async (req, res) => {
      req.user = mockUser
      return await UserController.processGithubAuth(req, res)
    })
    sinon.stub(githubUtil, 'getEmails').returns([{email: 'jon@foo.com'}])
  });

  afterEach(async () => {
    try {
      sinon.restore();
      await Factory.destroyAll()
    } catch (error) {
      console.error('ERROR: UserController.test.js afterEach ', error)
    }
  })

  describe('GET /me', () => {
    it('should return all user details', async () => {
      const req = mockRequest()
      req.user = mockUser
      const res = mockResponse()

      try {
        await UserController.me(req, res)
      } catch (error) {
        console.error(error)
      }

      expect(res.status).to.have.been.calledWith(200)
      const responseUser = res.send.args[0][0].user
      expect(responseUser.id).to.equal(mockUser.id)
      expect(responseUser.displayName).to.equal(mockUser.displayName)
      expect(responseUser.UserEmails).to.have.length(0)
      expect(res.send.args[0][0].repos).to.have.length(1)
    });

    it('should return all user repos', async () => {
      let {user, project} = await Factory.createUserWithProject()
      const req = mockRequest({user})
      const res = mockResponse()

      req.user = user
      await UserController.me(req, res)

      expect(res.status(200).send).to.have.been.calledWith(sinon.match.hasNested("repos[0].id", project.dataValues.id))
    });
  });

  describe('POST /account', () => {
    it('should update a user account', async () => {
      const req = mockRequest({
        body: {
          displayName: 'newNameWhoDis',
          website: 'newWebsiteWhoDis',
        }
      })
      const res = mockResponse()
      let user = await Factory.createUser()
      req.user = user.dataValues

      await UserController.update(req, res)

      let foundUser = await Helper.findUser({id: user.id})

      expect(foundUser.dataValues.website).to.equal('newWebsiteWhoDis')
      expect(foundUser.dataValues.displayName).to.equal('newNameWhoDis')
      expect(res.status).to.have.been.calledWith(200)
    });
  });
  describe('DELETE /account', () => {
    it('should delete a user', async () => {
      const req = mockRequest({
        body: {
          displayName: 'newNameWhoDis',
          website: 'newWebsiteWhoDis',
        }
      })
      const res = mockResponse()
      let user = await Factory.createUser()
      req.user = user

      await UserController.delete(req, res)
      let foundUser = await Helper.findUser({id: user.id})

      expect(foundUser).to.equal(null)
      expect(res.status).to.have.been.calledWith(200)
    });
  });
  describe('POST /user/setIsOnboarded', () => {
    it('should update a user to set is onboarded = true', async () => {
      let user = await Factory.createUser()
      const req = mockRequest({user})
      const res = mockResponse()

      await UserController.setIsOnboarded(req, res)
      let foundUser = await Helper.findUser({id: user.id})

      expect(foundUser.dataValues.isOnboarded).to.equal(true)
      expect(res.status).to.have.been.calledWith(200)
    });
  });
});
