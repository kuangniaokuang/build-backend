const { createProjectBadge, projectHasMinimumElocs } = require('./common')
const { getContributionBadgeData } = require('../analyticsApi/badgeData')
const thresholds = require('../../../config/env/thresholds')(process.env.NODE_ENV)

const BADGE_NAME = 'contribution'
const BADGE_TYPE = 'contribution'

module.exports = {
  async generateBadges (user, projectId, eeProjectId) {
    const contributionBadgeData = await getContributionBadgeData(eeProjectId, user.emails)
    const hasMinimumElocs = await projectHasMinimumElocs(eeProjectId, thresholds.badges.contribution.minEloc)

    const meetsThreshold = hasMinimumElocs && parseInt(contributionBadgeData.max_dev_rank) >= thresholds.badges.contribution.minContributors

    return await createProjectBadge({
      badgeType: BADGE_TYPE,
      badgeName: BADGE_NAME,
      badgeTitle: `Contribution to #${contributionBadgeData.project_name}`,
      badgeNameForNotification: 'Contribution',
      rankNumerator: contributionBadgeData.dev_rank || null,
      rankDenominator: contributionBadgeData.max_dev_rank || null,
      description: `${Number((contributionBadgeData.dev_value * 100).toFixed(2))}% contribution`,
      userId: user.id,
      projectName: contributionBadgeData.project_name || null,
      projectId,
      meetsThreshold,
      user
    })
  }
}
