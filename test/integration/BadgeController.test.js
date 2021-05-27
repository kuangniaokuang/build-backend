const sinon = require('sinon')
const chai = require("chai");
const { expect } = chai
const sinonChai = require("sinon-chai");
const {
  mockRequest,
  mockResponse
} = require('mock-req-res')

const BadgeController = require('../../api/controllers/BadgeController')
const Factory = require('../factory')
const Helpers = require('../util/helpers')
const { formatBadgeForApiResponse } = require('../../api/util/apiResponseFormatter')

chai.use(sinonChai);

describe('BadgeController', () => {

  afterEach(async () => {
    try {
      sinon.restore();
      await Factory.destroyAll()
    } catch (error) {
      console.error('ERROR: BadgeController.test.js afterEach ', error)
    }
  })

  describe ('GET /badges', () => {
    it('should return all badges for current user', async () => {
      let newUser = await Factory.createUserWithManyBadges(5)

      const req = mockRequest({user: newUser})
      const res = mockResponse()

      await BadgeController.badges(req, res)

      let foundBadge = await Helpers.findBadge({
        user: newUser.dataValues.id
      })

      expect(res.status).to.have.been.calledWith(200)

      const data = res.send.args[0][0].data
      expect(data[0]).to.deep.equal(formatBadgeForApiResponse(foundBadge))
      expect(data).to.have.length(5)
    });
  });

  describe('GET /badge/:id', () => {
    it('find a single badge by id', async () => {
      let newUser = await Factory.createUserWithManyBadges(5)
      let foundBadge = await Helpers.findBadge({user: newUser.dataValues.id})

      const req = mockRequest({
        params: {
          id: foundBadge.id
        }
      })
      const res = mockResponse()

      await BadgeController.badge(req, res)

      expect(res.status).to.have.been.calledWith(200)
      expect(res.send.args[0][0]).to.deep.equal(formatBadgeForApiResponse(foundBadge))
      expect(res.send.args[0][0].BadgeType.icon).to.exist
    });
  });

});
