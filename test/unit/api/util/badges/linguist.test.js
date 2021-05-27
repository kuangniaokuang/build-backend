const { expect } = require('chai')

const { Badge } = require('../../../../../db/models')
const languageThresholds = require('../../../../../config/env/thresholds')(process.env.NODE_ENV).badges.linguist
const { grades: badgeGrades } = require('../../../../../api/constants/badges')
const { JAVASCRIPT, JAVA, PYTHON, CPP, C, GO, TYPESCRIPT, RUBY } = require('../../../../../api/constants/languages')
const { getLinguistBadgeGrade, getPercentileFromBadge } = require('../../../../../api/util/badges/linguist')

describe('linguist', () => {
  describe('getLinguistBadgeGrade', () => {
    it('works for javascript', () => {
      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.gold]+1000, JAVASCRIPT)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.gold], JAVASCRIPT)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.gold]-1, JAVASCRIPT)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.silver], JAVASCRIPT)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.silver]-1, JAVASCRIPT)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.bronze], JAVASCRIPT)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.bronze]-1, JAVASCRIPT)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.iron], JAVASCRIPT)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[JAVASCRIPT][badgeGrades.iron]-1, JAVASCRIPT)).to.equal(badgeGrades.none)
    })

    it('works for java', () => {
      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.gold]+1000, JAVA)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.gold], JAVA)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.gold]-1, JAVA)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.silver], JAVA)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.silver]-1, JAVA)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.bronze], JAVA)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.bronze]-1, JAVA)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.iron], JAVA)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[JAVA][badgeGrades.iron]-1, JAVA)).to.equal(badgeGrades.none)
    })

    it('works for python', () => {
      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.gold]+1000, PYTHON)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.gold], PYTHON)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.gold]-1, PYTHON)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.silver], PYTHON)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.silver]-1, PYTHON)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.bronze], PYTHON)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.bronze]-1, PYTHON)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.iron], PYTHON)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[PYTHON][badgeGrades.iron]-1, PYTHON)).to.equal(badgeGrades.none)
    })

    it('works for C++', () => {
      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.gold]+1000, CPP)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.gold], CPP)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.gold]-1, CPP)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.silver], CPP)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.silver]-1, CPP)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.bronze], CPP)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.bronze]-1, CPP)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.iron], CPP)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[CPP][badgeGrades.iron]-1, CPP)).to.equal(badgeGrades.none)
    })

    it('works for C', () => {
      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.gold]+1000, C)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.gold], C)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.gold]-1, C)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.silver], C)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.silver]-1, C)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.bronze], C)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.bronze]-1, C)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.iron], C)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[C][badgeGrades.iron]-1, C)).to.equal(badgeGrades.none)
    })

    it('works for go', () => {
      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.gold]+1000, GO)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.gold], GO)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.gold]-1, GO)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.silver], GO)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.silver]-1, GO)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.bronze], GO)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.bronze]-1, GO)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.iron], GO)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[GO][badgeGrades.iron]-1, GO)).to.equal(badgeGrades.none)
    })

    it('works for typescript', () => {
      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.gold]+1000, TYPESCRIPT)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.gold], TYPESCRIPT)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.gold]-1, TYPESCRIPT)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.silver], TYPESCRIPT)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.silver]-1, TYPESCRIPT)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.bronze], TYPESCRIPT)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.bronze]-1, TYPESCRIPT)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.iron], TYPESCRIPT)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[TYPESCRIPT][badgeGrades.iron]-1, TYPESCRIPT)).to.equal(badgeGrades.none)
    })

    it('works for ruby', () => {
      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.gold]+1000, RUBY)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.gold], RUBY)).to.equal(badgeGrades.gold)
      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.gold]-1, RUBY)).to.equal(badgeGrades.silver)

      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.silver], RUBY)).to.equal(badgeGrades.silver)
      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.silver]-1, RUBY)).to.equal(badgeGrades.bronze)

      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.bronze], RUBY)).to.equal(badgeGrades.bronze)
      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.bronze]-1, RUBY)).to.equal(badgeGrades.iron)

      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.iron], RUBY)).to.equal(badgeGrades.iron)
      expect(getLinguistBadgeGrade(languageThresholds[RUBY][badgeGrades.iron]-1, RUBY)).to.equal(badgeGrades.none)
    })
  })

  describe ('getPercentileFromBadge', () => {
    it ('returns the right value for a gold badge', () => {
      const silverBadge = Badge.build({
          name: 'Linguist for JavaScript',
          grade: 'GOLD',
          rankNumerator: '10000'
      })

      expect(getPercentileFromBadge(silverBadge)).to.equal(10)
    })

    it ('returns the right value for a silver badge', () => {
      const silverBadge = Badge.build({
          name: 'Linguist for JavaScript',
          grade: 'SILVER',
          rankNumerator: '4000'
      })

      expect(getPercentileFromBadge(silverBadge)).to.equal(17)
    })

    it ('returns the right value for a bronze badge', () => {
      const bronzeBadge = Badge.build({
          name: 'Linguist for JavaScript',
          grade: 'BRONZE',
          rankNumerator: '500'
      })

      expect(getPercentileFromBadge(bronzeBadge)).to.equal(42)
    })

    it ('returns the right value for a iron badge', () => {
      const ironBadge = Badge.build({
          name: 'Linguist for JavaScript',
          grade: 'IRON',
          rankNumerator: '60'
      })

      expect(getPercentileFromBadge(ironBadge)).to.equal(73)
    })

    it ('returns the right value for a locked badge', () => {
      const lockedBadge = Badge.build({
          name: 'Linguist for JavaScript',
          grade: 'NONE',
          rankNumerator: '1'
      })

      expect(getPercentileFromBadge(lockedBadge)).to.equal(99)
    })
  })
})
