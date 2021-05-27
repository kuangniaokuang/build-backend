const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const linguist = require('../../../api/util/badges/linguist')
const multilingual = require('../../../api/util/badges/multilingual')
const { findUser } = require('../../util/helpers')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('multilingual badges', () => {
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

  it ('creates a gold multilingual badge', async () => {
    const linguistBadges = await linguist.generateBadges(user)

    expect(linguistBadges).to.have.length(3)

    const multilingualBadge = await multilingual.generateBadges(user, linguistBadges)

    expect(multilingualBadge.get('grade')).to.equal('BRONZE')
    expect(multilingualBadge.get('type')).to.equal('multilingual')
    expect(multilingualBadge.get('rankNumerator')).to.equal('3')
  })
})
