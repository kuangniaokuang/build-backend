const { UserNotification } = require('../../db/models')

module.exports = {

  create: async ({ user, message, url = '', type = 'badge' }) => {
    const createdAt = new Date()
    const updatedAt = createdAt
    const notification = await UserNotification.create({
      user,
      type,
      message,
      url,
      createdAt,
      updatedAt
    })
    return {
      notification
    }
  },
  getAllByUser: async (userId, unread = true) => {
    try {
      const notifications = await UserNotification.findAll({
        where: {
          user: userId,
          isRead: !unread
        },
        order: [
          ['createdAt', 'DESC']
        ]
      })

      return notifications
    } catch (error) {
      throw new Error(error)
    }
  },
  markAsRead: async (id, user) => {
    try {
      const notificationRead = await UserNotification.update({
        isRead: true,
        updatedAt: new Date()
      }, {
        where: {
          user: user.id,
          id
        }
      })
      return { notificationRead }
    } catch (error) {
      throw new Error(error)
    }
  },

  delete: async () => {

  }

}
