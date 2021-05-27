const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/linguist')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('test of time badges', () => {
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

  it ('generates 3 linguist badges', async () => {
    const badges = await generateBadges(user)

    expect(badges).to.have.length(3)

    let goBadge, jsBadge, cBadge
    badges.forEach(badge => {
      if (badge.get('name').includes('Linguist for C')) {
        cBadge = badge
      } else if (badge.get('name').includes('Linguist for JavaScript')) {
        jsBadge = badge
      } else if (badge.get('name').includes('Linguist for Go')) {
        goBadge = badge
      }
    })

    expect(goBadge.get('grade')).to.equal('SILVER')
    expect(goBadge.get('rankNumerator')).to.equal('82')

    expect(jsBadge.get('grade')).to.equal('GOLD')
    expect(jsBadge.get('rankNumerator')).to.equal('135')

    expect(cBadge.get('grade')).to.equal('GOLD')
    expect(cBadge.get('rankNumerator')).to.equal('164')


    // test that regenerating the badges still only returns three badges and that their ids are the same as the originals
    const refreshedBadges = await generateBadges(user)

    let refreshedGoBadge, refreshedJsBadge, refreshedCBadge
    refreshedBadges.forEach(badge => {
      if (badge.get('name').includes('Linguist for C')) {
        refreshedCBadge = badge
      } else if (badge.get('name').includes('Linguist for JavaScript')) {
        refreshedJsBadge = badge
      } else if (badge.get('name').includes('Linguist for Go')) {
        refreshedGoBadge = badge
      }
    })

    expect(refreshedCBadge.get('id')).to.equal(cBadge.get('id'))
    expect(refreshedGoBadge.get('id')).to.equal(goBadge.get('id'))
    expect(refreshedJsBadge.get('id')).to.equal(jsBadge.get('id'))
  })
})
