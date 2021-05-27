const sinon = require('sinon')
const chai = require("chai");
const { expect } = chai
const { mockRequest, mockResponse } = require('mock-req-res');

const { User, UserNotification } = require('../../db/models')
const NotificationController = require('../../api/controllers/NotificationController');
const userNotificationUtil = require('../../api/util/userNotification')

describe('NotificationController', () => {
  const userId = 2
  let user

  before(async () => {
    user = await User.findByPk(userId)

    user = user.dataValues
  })

  afterEach(async () => {
    sinon.restore();
  })

  describe('notifications', () => {
    it('should fetch notifications', async () => {
      const req = mockRequest({ user })
      const res = mockResponse()

      await NotificationController.notifications(req, res)

      expect(res.status).to.have.been.calledWith(200)
      const notifications = res.send.args[0][0].data

      expect(notifications).to.have.length(10)
      expect(notifications.every(notification => !notification.isRead)).to.be.true
      expect(notifications.every(notification => notification.user === userId)).to.be.true
    });

    it ('fetch should return 500 if it throws', async () => {
      sinon.stub(userNotificationUtil, 'getAllByUser').rejects('No users buddy')

      const req = mockRequest({ user })
      const res = mockResponse()

      await NotificationController.notifications(req, res)

      expect(res.status).to.have.been.calledWith(500)
    })

    it('should mark as read', async () => {
      const notificationId = 23
      const req = mockRequest({
        params: { id: notificationId },
        user,
      })
      const res = mockResponse()

      await NotificationController.read(req, res)

      expect(res.status).to.have.been.calledWith(200)
      const notification = await UserNotification.findByPk(notificationId)

      expect(notification.get('isRead')).to.be.true
    })

    it ('mark as read should return 500 if it throws', async () => {
      sinon.stub(userNotificationUtil, 'markAsRead').rejects('Cannot mark it as read')

      const req = mockRequest({
        params: { id: 999 },
        user,
      })
      const res = mockResponse()

      await NotificationController.read(req, res)

      expect(res.status).to.have.been.calledWith(500)
    })
  });
});
