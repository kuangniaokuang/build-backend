const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/mineSweeper')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('minesweeper badges', () => {
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

  it ('creates a minesweeper badge', async () => {
    const eeProjectId = 'ad99d928-5a14-4858-92e4-b53ce50c4444' // minesweeper-meets-eloc-threshold
    const projectId = 9

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.exist
    expect(badge.get('grade')).to.equal('GOLD')
    expect(badge.get('rankNumerator')).to.equal('1')
    expect(badge.get('rankDenominator')).to.equal('1')
    expect(badge.get('description')).to.equal('Removed 2 complex functions')
  })

  it('does not create a minesweeper badge for a project that does not deserve it', async () => {
    const eeProjectId = 'a1eb4c6d-8739-4b4f-8430-739ac542aac1' // 710-loc-python
    const projectId = 6

    const badge = await generateBadges(user, projectId, eeProjectId)

    expect(badge).to.not.exist
  })
})
