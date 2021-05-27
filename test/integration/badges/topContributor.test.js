const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/topContributor')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('topContributor badges', () => {
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

  it ('creates a top contributor badge', async () => {
    const eeProjectId = '19bb3bc8-c19a-454d-890b-7ce2aff14913' // QA100ELOC
    const projectId = 5

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.exist
    expect(badge.get('grade')).to.equal('SILVER')
    expect(badge.get('rankNumerator')).to.equal('2')
    expect(badge.get('rankDenominator')).to.equal('3')
  })

  it('does not create a top contributor badge for a project that does not deserve it', async () => {
    const eeProjectId = 'd4accf44-d88b-4ace-ab8a-27cd179bb735' // linguist-gold
    const projectId = 4

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.not.exist
  })
})
