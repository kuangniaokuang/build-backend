const sequelize = require('../ceQuery').connection()
const {
  reduceCount,
  createBadge,
  getLinguistBadges
} = require('./common')
const { getUserElocsForAllLanguages } = require('../analyticsApi/badgeData')
const projectUtil = require('../project')
const { grades, medalPercentiles, types } = require('../../constants/badges')
const languageThresholds = require('../../../config/env/thresholds')(process.env.NODE_ENV).badges.linguist

const BADGE_NAME = 'linguist'
const BADGE_TYPE = types.linguist

const getLinguistBadgeData = async (userId, userEmails, transaction) => {
  const projects = await projectUtil.getAllByUserId(userId, transaction)
  const eeProjectIds = projects.map((project) => project.eeProjectId)

  return await getUserElocsForAllLanguages(userEmails, eeProjectIds, transaction)
}

const findBadgeForLanguage = (badges, language) => {
  return badges.find(badge => badge.get('description').includes(language))
}

module.exports = {
  async generateBadges (user) {
    const transaction = await sequelize.transaction()

    try {
      const previousBadges = await getLinguistBadges(user.id, transaction)
      const linguistBadgeData = await getLinguistBadgeData(user.id, user.emails, transaction)

      const linguistBadges = []
      for (let i = 0; i < linguistBadgeData.length; i++) {
        const data = linguistBadgeData[i]

        if (!(data.language in languageThresholds)) {
          console.warn(`Repo with unsupported language (${data.language}) does not get a linguist badge`)
          continue
        }

        const previousBadge = findBadgeForLanguage(previousBadges, data.language)
        const grade = module.exports.getLinguistBadgeGrade(data.dev_equivalent, data.language)

        const createdBadge = await createBadge({
          badgeName: BADGE_NAME,
          badgeType: BADGE_TYPE,
          badgeTitle: `Linguist for ${data.language}`,
          badgeNameForNotification: 'Linguist',
          description: `${reduceCount(data.dev_equivalent)} ELOCs in #${data.language}`,
          rankNumerator: data.dev_equivalent,
          rankDenominator: '',
          grade,
          projectName: 'Global Badge',
          projectId: null,
          userId: user.id,
          previousBadge,
          user
        }, transaction)

        linguistBadges.push(createdBadge)
      }

      await transaction.commit()

      return linguistBadges
    } catch (error) {
      transaction.rollback()

      throw error
    }
  },

  getLinguistBadgeGrade (elocs, language) {
    let grade = grades.none

    if (elocs >= languageThresholds[language][grades.gold]) {
      grade = grades.gold
    } else if (elocs >= languageThresholds[language][grades.silver]) {
      grade = grades.silver
    } else if (elocs >= languageThresholds[language][grades.bronze]) {
      grade = grades.bronze
    } else if (elocs >= languageThresholds[language][grades.iron]) {
      grade = grades.iron
    }

    return grade
  },

  getPercentileFromBadge (badge) {
    const getPercentileWithinRange = (elocs, lowerGrade, higherGrade) => {
      const lowerThresholdElocs = languageThresholds[language][lowerGrade]
      const upperThresholdElocs = languageThresholds[language][higherGrade]
      const elocRange = upperThresholdElocs - lowerThresholdElocs
      const elocsWithinRange = elocs - lowerThresholdElocs
      const percentileRange = medalPercentiles[lowerGrade] - medalPercentiles[higherGrade]

      return parseInt(Math.ceil(medalPercentiles[lowerGrade] - (percentileRange * (elocsWithinRange / elocRange))))
    }

    const language = module.exports.getLanguageFromLinguistBadge(badge)
    const medal = badge.get('grade')

    if (medal === grades.gold) {
      return 10
    } else if (medal === grades.silver) {
      return getPercentileWithinRange(badge.get('rankNumerator'), grades.silver, grades.gold)
    } else if (medal === grades.bronze) {
      return getPercentileWithinRange(badge.get('rankNumerator'), grades.bronze, grades.silver)
    } else if (medal === grades.iron) {
      return getPercentileWithinRange(badge.get('rankNumerator'), grades.iron, grades.bronze)
    } else {
      return 99
    }
  },

  getLanguageFromLinguistBadge (linguistBadge) {
    return linguistBadge.get('name').replace('Linguist for ', '')
  }
}
