const _sumBy = require('lodash/sumBy')

const sequelize = require('../ceQuery').connection()
const {
  reduceCount,
  getMultilingualBadge,
  createBadge,
  destroyOldBadge
} = require('./common')
const { grades } = require('../../constants/badges')

const BADGE_NAME = 'multilingual'
const BADGE_TYPE = 'multilingual'

const getMultilingualBadgeDescripion = (totalElocs, usersLinguistBadgeCount) => {
  return `${reduceCount(totalElocs)} ELOCs in ${usersLinguistBadgeCount} languages`
}

const WORTHY_BADGE_GRADES = [grades.gold, grades.silver, grades.bronze]

module.exports = {
  calculateMultilingualBadgeGrade (numberOfLanguages) {
    switch (true) {
      case (numberOfLanguages >= 5):
        return grades.gold
      case (numberOfLanguages === 4):
        return grades.silver
      case (numberOfLanguages === 3):
        return grades.bronze
      default:
        return grades.none
    }
  },
  async generateBadges (user, linguistBadges) {
    const transaction = await sequelize.transaction()

    try {
      const previousBadge = await getMultilingualBadge(user.id, transaction)

      const allWorthyLinguistBadges = linguistBadges.filter(linguistBadge => {
        return WORTHY_BADGE_GRADES.includes(linguistBadge.getDataValue('grade'))
      })

      if (allWorthyLinguistBadges.length < 3) {
        if (previousBadge) {
          await destroyOldBadge(user.id, BADGE_TYPE, null, transaction)
        }

        transaction.commit()
        return
      }

      const totalElocs = _sumBy(allWorthyLinguistBadges, (linguistBadge) => parseInt(linguistBadge.rankNumerator))
      const rankNumerator = allWorthyLinguistBadges.length
      const grade = module.exports.calculateMultilingualBadgeGrade(rankNumerator)
      const description = getMultilingualBadgeDescripion(parseInt(totalElocs), allWorthyLinguistBadges.length)

      const createdBadge = await createBadge({
        badgeName: BADGE_NAME,
        badgeType: BADGE_TYPE,
        badgeTitle: 'Multilingual',
        badgeNameForNotification: 'Multilingual',
        description,
        rankNumerator,
        rankDenominator: 5,
        grade,
        projectName: 'Multiple Languages',
        projectId: null,
        userId: user.id,
        previousBadge,
        user
      }, transaction)

      transaction.commit()

      return createdBadge
    } catch (error) {
      transaction.rollback()

      throw error
    }
  }
}
