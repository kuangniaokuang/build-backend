const { expect } = require('chai')

const { grades: badgeGrades } = require('../../../../../api/constants/badges')
const { calculateMultilingualBadgeGrade } = require('../../../../../api/util/badges/multilingual')

describe('multilingual', () => {
  describe('getLinguistBadgeGrade', () => {
    it('gets the right grade', () => {
      expect(calculateMultilingualBadgeGrade(10)).to.equal(badgeGrades.gold)
      expect(calculateMultilingualBadgeGrade(5)).to.equal(badgeGrades.gold)
      expect(calculateMultilingualBadgeGrade(4)).to.equal(badgeGrades.silver)
      expect(calculateMultilingualBadgeGrade(3)).to.equal(badgeGrades.bronze)
      expect(calculateMultilingualBadgeGrade(2)).to.equal(badgeGrades.none)
      expect(calculateMultilingualBadgeGrade(1)).to.equal(badgeGrades.none)
      expect(calculateMultilingualBadgeGrade(0)).to.equal(badgeGrades.none)
    })
  })
})
