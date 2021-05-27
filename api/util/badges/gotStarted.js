const { createBadge, find } = require('./common')
const { grades } = require('../../constants/badges')

const BADGE_NAME = 'gotStarted'
const BADGE_TYPE = 'gotStarted'

module.exports = {
  async generateBadges (user) {
    const previousBadge = await find({
      where: {
        type: BADGE_TYPE,
        user: user.get('id')
      }
    })

    if (!previousBadge) {
      return await createBadge({
        badgeType: BADGE_TYPE,
        badgeName: BADGE_NAME,
        badgeTitle: 'Got Started',
        badgeNameForNotification: 'Got Started',
        rankNumerator: 1,
        rankDenominator: 10,
        grade: grades.gold,
        description: 'Created account at Merico',
        projectName: null,
        userId: user.get('id'),
        projectId: null,
        previousBadge: null,
        user: user.dataValues
      })
    }
  }
}
