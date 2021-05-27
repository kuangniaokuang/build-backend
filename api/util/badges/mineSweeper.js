const { createProjectBadge, projectHasMinimumElocs } = require('./common')
const { getMinesweeperBadgesData } = require('../analyticsApi/badgeData')
const thresholds = require('../../../config/env/thresholds')(process.env.NODE_ENV)

const BADGE_NAME = 'minesweeper'
const BADGE_TYPE = 'minesweeper'

module.exports = {
  async generateBadges (user, projectId, eeProjectId) {
    const minesweeperBadgeData = await getMinesweeperBadgesData(eeProjectId, user.emails)
    const meetsThreshold = await projectHasMinimumElocs(eeProjectId, thresholds.badges.mineSweeper.minEloc)

    return await createProjectBadge({
      badgeType: BADGE_TYPE,
      badgeName: BADGE_NAME,
      badgeTitle: `Minesweeper of ${minesweeperBadgeData.project_name}`,
      badgeNameForNotification: 'Minesweeper',
      rankNumerator: minesweeperBadgeData.dev_rank || null,
      rankDenominator: minesweeperBadgeData.max_dev_rank || null,
      description: `Removed ${minesweeperBadgeData.bomb_count} complex functions`,
      userId: user.id,
      projectName: minesweeperBadgeData.project_name,
      projectId,
      meetsThreshold,
      user
    })
  }
}
