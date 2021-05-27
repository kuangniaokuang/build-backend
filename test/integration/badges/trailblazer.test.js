const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/trailblazer')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('trailblazer badges', () => {
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

  it ('creates a trailblazer badge', async () => {
    const eeProjectId = '34639809-daf0-4407-bde3-5923172fc3eb'
    const projectId = 10

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.exist

    expect(badge.get('grade')).to.equal('SILVER')
    expect(badge.get('rankNumerator')).to.equal('2')
    expect(badge.get('rankDenominator')).to.equal('3')
    expect(badge.get('type')).to.equal('trailblazer')
  })

  it('does not create a trailblazer badge for a project that does not deserve it', async () => {
    const eeProjectId = 'd4accf44-d88b-4ace-ab8a-27cd179bb735'
    const projectId = 4

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.not.exist
  })
})
