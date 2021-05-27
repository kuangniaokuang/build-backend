const { getElocsForProject } = require('../analyticsApi/badgeData')
const sequelize = require('../ceQuery').connection()
const { Badge, BadgeType } = require('../../../db/models')
const badgeImageGenerator = require('./badgeImageGenerator')
const { grades } = require('../../constants/badges')
const userNotificationUtil = require('../userNotification')

const { MP } = require('../../../api/util/mixpanel')

const badgeChanged = (oldBadge, newBadge) => {
  return !oldBadge ||
    !newBadge ||
    oldBadge.rankDenominator !== newBadge.rankDenominator ||
    oldBadge.rankNumerator !== newBadge.rankNumerator ||
    oldBadge.grade !== newBadge.grade
}

// TODO: we should create a badgeNotifications file
const badgeGradeWarrantsNotification = (badge) => {
  return [
    grades.gold,
    grades.silver,
    grades.bronze,
    grades.iron
  ].includes(badge.getDataValue('grade'))
}

module.exports = {
  async createProjectBadge ({
    badgeType,
    badgeName,
    badgeTitle,
    badgeNameForNotification,
    rankNumerator,
    rankDenominator,
    description,
    userId,
    projectName,
    projectId,
    meetsThreshold,
    user
  }) {
    const transaction = await sequelize.transaction()

    try {
      const previousBadge = await module.exports.getBadgeByProject(projectId, badgeType, userId)

      if (!rankDenominator || !meetsThreshold) {
        await module.exports.destroyOldBadge(userId, badgeType, projectId, transaction)

        transaction.commit()

        return
      }

      const grade = module.exports.calculateBadgeGrade(rankNumerator, rankDenominator)

      const createdBadge = await module.exports.createBadge({
        badgeName,
        badgeType,
        badgeTitle,
        badgeNameForNotification,
        rankNumerator,
        rankDenominator,
        grade,
        description,
        projectName,
        userId,
        projectId,
        previousBadge,
        user
      }, transaction)

      await transaction.commit()

      return createdBadge
    } catch (error) {
      await transaction.rollback()

      throw error
    }
  },

  async destroyOldBadge (userId, badgeType, projectId, transaction) {
    const where = {
      user: userId,
      type: badgeType
    }

    if (projectId) {
      where.project = projectId
    }

    await Badge.destroy({ where }, { transaction })
  },

  async createBadge ({
    badgeName,
    badgeType,
    badgeTitle,
    badgeNameForNotification,
    rankNumerator,
    rankDenominator,
    grade,
    description,
    projectName,
    userId,
    projectId,
    previousBadge,
    user = null
  }, transaction) {
    const { icon, title } = await module.exports.getBadgeType(badgeType)
    const imageUrl = await module.exports.generateBadgeImage({ badgeName, icon, title, grade, description, projectName, userId })

    const createdBadge = await module.exports.create(
      {
        name: badgeTitle,
        code: badgeName,
        rankNumerator,
        rankDenominator,
        description,
        imageUrl: imageUrl,
        user: userId,
        project: projectId,
        type: badgeType,
        grade
      },
      previousBadge,
      transaction
    )

    const notificationMessage = `Congratulations! You have earned a new ${badgeNameForNotification} badge!`
    await module.exports.sendNewBadgeNotification(createdBadge, previousBadge, notificationMessage, user)

    return createdBadge
  },

  calculateBadgeGrade (rankNumerator, rankDenominator) {
    return rankDenominator < 10
      ? module.exports.rankUnder10(rankNumerator)
      : module.exports.getBadgeGradeByPercent(rankNumerator, rankDenominator)
  },

  async create (badgeToCreate, previousBadge, transaction) {
    if (previousBadge) {
      badgeToCreate.id = previousBadge.get('id')
    }

    const result = await Badge.upsert(badgeToCreate, { transaction })

    return result[0]
  },

  async find (options) {
    return await Badge.findOne(options)
  },

  async getBadgeType (typeCode) {
    try {
      return await BadgeType.findOne({
        where: { code: typeCode }
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  async getBadgeByProject (project, type, user, transaction) {
    try {
      const badge = await Badge.findOne({
        where: {
          project,
          type,
          user
        },
        order: [
          ['createdAt', 'DESC']
        ],
        transaction
      })
      return badge
    } catch (error) {
      throw new Error(error)
    }
  },

  async getLinguistBadges (user, transaction) {
    try {
      const badge = await Badge.findAll({
        where: {
          type: 'linguist',
          user
        },
        transaction
      })

      return badge
    } catch (error) {
      throw new Error(error)
    }
  },

  async getMultilingualBadge (user, transaction) {
    try {
      return await Badge.findOne({
        where: {
          user: user,
          type: 'multilingual'
        },
        transaction
      })
    } catch (error) {
      throw new Error(error)
    }
  },

  async sendNewBadgeNotification (newBadge, previousBadge, message = 'Congratulations! You have earned a new badge!', user = null) {
    if (badgeChanged(previousBadge, newBadge) && badgeGradeWarrantsNotification(newBadge)) {
      const notification = {
        user: newBadge.getDataValue('user'),
        message,
        url: `/badges/assertion/${newBadge.getDataValue('id')}`,
        type: 'badge'
      }
      await userNotificationUtil.create(notification)
      // MP Analytics Tracking (New Badge Generated)
      if (user && newBadge) {
        module.exports.sendAnalyticsEvents(user, newBadge)
      }
    }
  },

  async generateBadgeImage ({
    badgeName,
    icon,
    title,
    grade,
    description,
    projectName,
    userId
  }) {
    const imageData = {
      userId,
      grade,
      type: {
        name: badgeName,
        icon
      },
      title,
      messages: [
        description
      ],
      project: {
        name: projectName
      }
    }

    const badgeImages = await badgeImageGenerator.generateMultipleImages(imageData, [{
      width: 360,
      height: 204
    }])

    return badgeImages[0] || ''
  },

  getBadgeGradeByPercent (numerator, denominator) {
    const percentile = numerator / denominator
    let grade

    if (percentile <= 0.1) {
      grade = grades.gold
    } else if (percentile <= 0.25) {
      grade = grades.silver
    } else if (percentile <= 0.5) {
      grade = grades.bronze
    } else if (percentile <= 0.8) {
      grade = grades.iron
    } else {
      grade = grades.none
    }

    return grade
  },
  reduceCount (number, factor = 1000, displayUnit = 'K', minCountDisplay = '<1') {
    if (number < factor) {
      return `${minCountDisplay}${displayUnit.toLowerCase()}`
    } else {
      return `${parseInt((number / factor), 10)}${displayUnit}+`
    }
  },
  rankUnder10 (rank) {
    const rankInt = parseInt(rank)

    if (rankInt === 1) {
      return grades.gold
    } else if (rankInt === 2 || rankInt === 3) {
      return grades.silver
    } else if (rankInt === 4 || rankInt === 5) {
      return grades.bronze
    } else if (rankInt === 6 || rankInt === 7 || rankInt === 8) {
      return grades.iron
    } else {
      return grades.none
    }
  },
  async projectHasMinimumElocs (eeProjectId, minElocs) {
    const elocs = await getElocsForProject(eeProjectId)

    return elocs > minElocs
  },
  sendAnalyticsEvents (user, badge) {
    try {
      MP.trackBadgeGenerated({ user, badge })
    } catch (e) {
      console.error('Mixpanel Tracking Error: New Badge Notification', e)
      // throw e
    }
  }
}
