const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai

chai.use(require('chai-datetime'));

const utils = require('../../../scripts/defaultRepo/utils')

describe('default repo utils', () => {
  describe('getCommits', () => {
    it ('returns a reversed array of commits', async () => {
      const repo = {
        async log () {
          return {
            all: [1, 2, 3]
          }
        }
      }

      const commits = await utils.getCommits(repo)
      expect(commits).to.deep.equal([3, 2, 1])
    })
  })

  describe('getCommitLimit', () => {
    it ('returns the number of commits if it is less than the default limit', () => {
      const numCommits = 10
      const maxCommits = 15

      expect(utils.getCommitLimit(numCommits, maxCommits)).to.equal(numCommits)
    })

    it ('returns the max commits if it is less than the number of commits', () => {
      const numCommits = 20
      const maxCommits = 15

      expect(utils.getCommitLimit(numCommits, maxCommits)).to.equal(maxCommits)
    })
  })

  describe('generateDatesForCommits', () => {
    it ('creates a bunch of dates in order', () => {
      const dates = utils.generateDatesForCommits(15)

      let lastDate = null
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i]

        if (lastDate) {
          expect(lastDate).beforeTime(date)

          expect(lastDate).closeToTime(date, 4 * 24 * 60 * 60) // the days are within 4 days of each other
        }

        lastDate = date
      }
    })
  })

  describe('createFakeCommitters', () => {
    it ('creates fake committers', () => {
      const committers = utils.createFakeCommitters(5)

      expect(committers).to.have.length(5)

      for (let i = 0; i < committers.length; i++) {
        const committer = committers[i]

        expect(committer).to.have.property('committerName')
        expect(committer.committerName).to.not.be.null

        expect(committer).to.have.property('committerEmail')
        expect(committer.committerEmail).to.not.be.null
      }
    })
  })
})
