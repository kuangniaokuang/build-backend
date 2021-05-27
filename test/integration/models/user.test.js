const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')

const { User, Badge } = require('../../../db/models')

describe ('user model', () => {
  it ('does not return tokens when we do a user find', async () => {
    const user = await User.findByPk(1)

    expect(user.dataValues).to.not.haveOwnProperty('githubAccessToken')
    expect(user.dataValues).to.not.haveOwnProperty('githubRefreshToken')
    expect(user.dataValues).to.not.haveOwnProperty('gitlabAccessToken')
    expect(user.dataValues).to.not.haveOwnProperty('gitlabRefreshToken')
  })

  it ('does not return user tokens when the user object is a child of another', async () => {
    const badge = await Badge.findByPk(44, {
      include: [{
        model: User
      }]
    })

    const user = badge.get('User')

    expect(user.dataValues).to.not.haveOwnProperty('githubAccessToken')
    expect(user.dataValues).to.not.haveOwnProperty('githubRefreshToken')
    expect(user.dataValues).to.not.haveOwnProperty('gitlabAccessToken')
    expect(user.dataValues).to.not.haveOwnProperty('gitlabRefreshToken')
  })
})
