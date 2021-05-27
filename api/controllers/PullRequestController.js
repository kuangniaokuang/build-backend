const pullRequestUtil = require('../util/pullRequest')
const { formatErrorResponse } = require('../util/apiResponseFormatter')

module.exports = {
  /**
   * For now this endpoint only returns PRs for the current user,
   * but eventually it could be made more general
   */
  async getPrStats (req, res) {
    try {
      const { user, query } = req
      const { gitUrl, startDate, endDate, userId } = query

      if (parseInt(userId) !== user.id) {
        return res.status(401).send(formatErrorResponse('Not authorized to view this user\'s data', { userId: query.userId }))
      }

      const { interval, stats } = await pullRequestUtil.getPrCountsForUser(user.id, user.emails, gitUrl, startDate, endDate)

      return res.status(200).send({
        data: {
          interval,
          stats
        }
      })
    } catch (error) {
      console.log('Unexpected error in PullRequestController:getUserPrStats', error)

      return res.status(500).send(formatErrorResponse('Unexpected error in PullRequestController:getUserPrStats', { stack: error.stack }))
    }
  }
}
