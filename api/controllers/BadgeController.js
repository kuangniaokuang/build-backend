const BadgeUtil = require('../util/badges')
const { formatBadgeForApiResponse } = require('../util/apiResponseFormatter')

module.exports = {
  badges: async (req, res) => {
    const userId = req.user.id
    try {
      const badges = await BadgeUtil.getAllByUser(userId)

      return res.status(200).send({ data: badges.map(formatBadgeForApiResponse) })
    } catch (error) {
      console.error('ERROR: badges-getAllByUser-fail: ', error)
      return res.status(500).send('ERROR: badges-getAllByUser-fail: ' + error)
    }
  },
  badge: async (req, res) => {
    const badgeId = parseInt(req.params.id, 10)
    if (!badgeId) {
      return res.status(500).send('INVALID BADGE ID')
    }
    try {
      const badge = await BadgeUtil.findOne(badgeId)

      return res.status(200).send(formatBadgeForApiResponse(badge))
    } catch (error) {
      console.error('ERROR: badges-getOne-fail: ', error)
      return res.status(500).send('ERROR: badges-getOne-fail: ' + error)
    }
  }
}
