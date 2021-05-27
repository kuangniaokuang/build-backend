const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/contribution')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('contribution badges', () => {
  let user

  beforeEach(async () => {
    sinon.stub(badgeImageGenerator, 'create').returns('ANY')
    sinon.stub(badgeImageGenerator, 'upload').returns('ANY')

    const userInstance = await findUser({ id: 1 })
    user = userInstance.dataValues

    user.emails = user.UserEmails.map((email) => {
      return email.dataValues.email
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it ('creates a contribution badge', async () => {
    const eeProjectId = '19bb3bc8-c19a-454d-890b-7ce2aff14913' // QA100ELOC
    const projectId = 5

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.exist
    expect(badge.get('grade')).to.equal('SILVER')
    expect(badge.get('rankNumerator')).to.equal('2')
    expect(badge.get('rankDenominator')).to.equal('3')
  })

  it('does not create a contribution badge for a project that does not deserve it', async () => {
    const eeProjectId = 'a1eb4c6d-8739-4b4f-8430-739ac542aac1' // 710-loc-python
    const projectId = 6

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.not.exist
  })
})
