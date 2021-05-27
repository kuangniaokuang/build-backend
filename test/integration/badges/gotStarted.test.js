const sinon = require('sinon');
const chai = require("chai");
const { expect } = chai

const { generateBadges } = require('../../../api/util/badges/gotStarted')
const { findUser, findUserNotification } = require('../../util/helpers')
const factory = require('../../factory')
const badgeImageGenerator = require('../../../api/util/badges/badgeImageGenerator')

describe('got started badge', () => {
  let user

  before(async () => {
    user = await factory.createUser()
  })

  beforeEach(async () => {
    sinon.stub(badgeImageGenerator, 'create').returns('ANY')
    sinon.stub(badgeImageGenerator, 'upload').returns('ANY')
  })

  afterEach(() => {
    sinon.restore()
  })

  after(async () => {
    await factory.destroyAll()
  })

  it('creates a got started badge', async () => {
    const badge = await generateBadges(user)

    expect(badge).to.exist
    expect(badge.get('grade')).to.equal('GOLD')
    expect(badge.get('rankNumerator')).to.equal('1')
    expect(badge.get('rankDenominator')).to.equal('10')
    expect(badge.get('type')).to.equal('gotStarted')
    expect(badge.get('name')).to.equal('Got Started')
    expect(badge.get('description')).to.equal('Created account at Merico')

    const notification = await findUserNotification({
      user: user.get('id'),
      message: 'Congratulations! You have earned a new Got Started badge!'
    })

    expect(notification).to.exist
  })

  /**
   * This test depends on the one above it to create a user and give them a got started badge
   */
  it('does not create a got started badge for users that already have one', async () => {
    const badge = await generateBadges(user)

    expect(badge).to.not.exist
  })
})
