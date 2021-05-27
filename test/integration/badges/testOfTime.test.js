const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/testOfTime')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('test of time badges', () => {
  let user

  beforeEach(async () => {
    sinon.stub(badgeImageGenerator, 'create').returns('ANY')
    sinon.stub(badgeImageGenerator, 'upload').returns('ANY')

    const userInstance = await findUser({ id: 2 })
    user = userInstance.dataValues

    user.emails = user.UserEmails.map((email) => {
      return email.dataValues.email
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it ('creates a test of time badge', async () => {
    const eeProjectId = 'a528a108-32bc-43e4-be86-223a69bac6c3' // test-of-time-meets-threshold
    const projectId = 8

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.exist
    expect(badge.get('grade')).to.equal('GOLD')
    expect(badge.get('rankNumerator')).to.equal('1')
    expect(badge.get('rankDenominator')).to.equal('1')
    expect(badge.get('type')).to.equal('testOfTime')
  })

  it('does not create a test of time badge for a project that does not deserve it', async () => {
    const eeProjectId = 'a1eb4c6d-8739-4b4f-8430-739ac542aac1' // 710-loc-python
    const projectId = 6

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.not.exist
  })
})
