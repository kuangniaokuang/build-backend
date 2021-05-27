const userNotificationUtil = require('../util/userNotification')
const { formatNotificationForApiResponse } = require('../util/apiResponseFormatter')

module.exports = {
  notifications: async (req, res) => {
    try {
      const userId = req.user.id
      const unread = req.query.unread !== undefined ? req.query.unread : true

      const notifications = await userNotificationUtil.getAllByUser(userId, unread)

      return res.status(200).send({ data: notifications.map(formatNotificationForApiResponse) })
    } catch (error) {
      return res.status(500).send('ERROR: notfications-getAllByUser-fail: ' + error)
    }
  },
  read: async (req, res) => {
    try {
      const user = req.user
      const notificationId = parseInt(req.params.id, 10)

      if (!user || !notificationId) {
        return res.status(500).send('INVALID USER OR NOTIFICATION ID')
      }

      const result = await userNotificationUtil.markAsRead(notificationId, user)

      return res.status(200).send(result)
    } catch (error) {
      return res.status(500).send('ERROR: notfications-readNotification-fail: ' + error)
    }
  }
}
