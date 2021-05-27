const { getContributionBadgeData } = require('../analyticsApi/badgeData')
const { createProjectBadge } = require('./common')
const thresholds = require('../../../config/env/thresholds')(process.env.NODE_ENV)

const MIN_CONTRIBUTORS = thresholds.badges.topContributor.minContributors
const BADGE_NAME = 'topContributor'
const BADGE_TYPE = 'topContributor'

module.exports = {
  async generateBadges (user, projectId, eeProjectId) {
    const contributionBadgeData = await getContributionBadgeData(eeProjectId, user.emails)
    const meetsThreshold = contributionBadgeData.max_dev_rank >= MIN_CONTRIBUTORS

    return await createProjectBadge({
      badgeType: BADGE_TYPE,
      badgeName: BADGE_NAME,
      badgeTitle: `Top ${contributionBadgeData.dev_rank} contributor by Dev Share`,
      badgeNameForNotification: 'Top Contributor',
      rankNumerator: contributionBadgeData.dev_rank || null,
      rankDenominator: contributionBadgeData.max_dev_rank || null,
      description: `Top ${contributionBadgeData.dev_rank} contributor by Dev Share`,
      userId: user.id,
      projectName: contributionBadgeData.project_name,
      projectId,
      meetsThreshold,
      user
    })
  }
}
