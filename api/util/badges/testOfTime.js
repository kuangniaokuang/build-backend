const { getTestOfTimeBadgeData } = require('../analyticsApi/badgeData')
const { createProjectBadge, projectHasMinimumElocs } = require('./common')
const thresholds = require('../../../config/env/thresholds')(process.env.NODE_ENV)

const BADGE_NAME = 'testOfTime'
const BADGE_TYPE = 'testOfTime'

module.exports = {
  async generateBadges (user, projectId, eeProjectId) {
    const testOfTimeBadgeData = await getTestOfTimeBadgeData(eeProjectId, user.emails)
    const meetsThreshold = await projectHasMinimumElocs(eeProjectId, thresholds.badges.testOfTime.minEloc)

    return await createProjectBadge({
      badgeType: BADGE_TYPE,
      badgeName: BADGE_NAME,
      badgeTitle: `Test of Time for ${testOfTimeBadgeData.project_name}`,
      badgeNameForNotification: 'Test of Time',
      rankNumerator: testOfTimeBadgeData.developer_rank || null,
      rankDenominator: testOfTimeBadgeData.dev_max_rank || null,
      description: 'Long Lasting Code',
      userId: user.id,
      projectName: testOfTimeBadgeData.project_name,
      projectId,
      meetsThreshold,
      user
    })
  }
}
