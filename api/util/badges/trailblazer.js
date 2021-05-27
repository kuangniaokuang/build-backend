const { createProjectBadge } = require('./common')
const { getTrailblazerBadgeData } = require('../analyticsApi/badgeData')
const thresholds = require('../../../config/env/thresholds')(process.env.NODE_ENV)

const MIN_CONTRIBUTORS = thresholds.badges.trailblazer.minContributors
const BADGE_NAME = 'trailblazer'
const BADGE_TYPE = 'trailblazer'

module.exports = {
  async generateBadges (user, projectId, eeProjectId) {
    const trailblazerBadgeData = await getTrailblazerBadgeData(eeProjectId, user.emails)

    const totalDevelopers = trailblazerBadgeData.total_contributors ? trailblazerBadgeData.total_contributors : 0
    const meetsThreshold = totalDevelopers >= MIN_CONTRIBUTORS && trailblazerBadgeData.trailblazer_rank

    return await createProjectBadge({
      badgeType: BADGE_TYPE,
      badgeName: BADGE_NAME,
      badgeTitle: `Tailblazer for ${trailblazerBadgeData.project_name}`,
      badgeNameForNotification: 'Trailblazer',
      rankNumerator: trailblazerBadgeData.trailblazer_rank,
      rankDenominator: totalDevelopers,
      description: `Contributor #${trailblazerBadgeData.trailblazer_rank}`,
      userId: user.id,
      projectName: trailblazerBadgeData.project_name,
      projectId,
      meetsThreshold,
      user
    })
  }
}
