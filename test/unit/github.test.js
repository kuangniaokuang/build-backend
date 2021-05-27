let assert = require('assert');
const sinon = require('sinon')
const chai = require('chai')
const {
  expect
} = chai
const github = require('../../api/util/github')

const {
  findPrimaryEmailAddress,
  getApiUrlFromWebUrl
} = require('../../api/util/github');

describe('github', () => {

  afterEach(()=>{
    sinon.restore()
  })

  describe('getApiUrlFromWebUrl', () => {
    it('formats the git url into the api url', () => {
      let url = "https://api.github.com/repos/facebook/react"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://api.github.com/repos/facebook/react')

      url = "git://api.github.com/repos/facebook/react"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://api.github.com/repos/facebook/react')

      url = "https://github.com/yumengwang03/Gizmo2018"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://api.github.com/repos/yumengwang03/Gizmo2018')
    })
  })
  describe('findPrimaryEmailAddress', () => {
    let emails

    beforeEach(() => {
      emails = [{
          email: 'paul.goertzen@merico.dev',
          primary: false,
          verified: true,
          visibility: null
        },
        {
          email: '75139737+paulgoertzen-merico@users.noreply.github.com',
          primary: false,
          verified: true,
          visibility: null
        },
        {
          email: 'paulngoertzen+merico@gmail.com',
          primary: true,
          verified: true,
          visibility: 'private'
        }
      ]
    })

    it('finds the primary if there is one and returns the email address as a string', () => {
      const primaryEmail = findPrimaryEmailAddress(emails)

      assert.strictEqual(emails[2].email, primaryEmail)
    })

    it('falls back to the first email in the array if it cannot find a primary email', () => {
      emails[2].primary = false
      const primaryEmail = findPrimaryEmailAddress(emails)

      assert.strictEqual(emails[0].email, primaryEmail)
    })
  })
})
