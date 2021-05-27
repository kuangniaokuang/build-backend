let assert = require('assert');
let { getBadgeGradeByPercent, rankUnder10 } = require('../../../../../api/util/badges/common')
const { grades: badgeGrades } = require('../../../../../api/constants/badges')

describe('common badge function', () => {
  describe('getBadgeGradeByPercent', () => {
    it ('when more than 10 contributors, it returns a NONE badge to the lowest ranked contributor', () => {
      const totalContributors = 12
      const contributorRank = 12

      const grade = getBadgeGradeByPercent(contributorRank, totalContributors)
      const expectedGrade = 'NONE'

      assert.strictEqual(expectedGrade, grade)
    })

    it ('when more than 10 contributors, it returns a GOLD badge to the top ranked contributor', () => {
      const totalContributors = 12
      const contributorRank = 1

      const grade = getBadgeGradeByPercent(contributorRank, totalContributors)
      const expectedGrade = 'GOLD'

      assert.strictEqual(expectedGrade, grade)
    })
  })

  describe('rankUnder10', () => {
    it ('gets the correct grade', () => {
      assert.strictEqual(rankUnder10(1), badgeGrades.gold)
      assert.strictEqual(rankUnder10(2), badgeGrades.silver)
      assert.strictEqual(rankUnder10(3), badgeGrades.silver)
      assert.strictEqual(rankUnder10(4), badgeGrades.bronze)
      assert.strictEqual(rankUnder10(5), badgeGrades.bronze)
      assert.strictEqual(rankUnder10(6), badgeGrades.iron)
      assert.strictEqual(rankUnder10(7), badgeGrades.iron)
      assert.strictEqual(rankUnder10(8), badgeGrades.iron)
      assert.strictEqual(rankUnder10(9), badgeGrades.none)
      assert.strictEqual(rankUnder10(10), badgeGrades.none)
    })
  })
})
