const sinon = require('sinon')
const chai = require("chai");
const {
  expect
} = chai
const {
  mockRequest,
  mockResponse
} = require('mock-req-res');
const EmailController = require('../../api/controllers/EmailController');
const Email = require('../../api/util/email')

describe('EmailController', () => {
  let sendEmailSpy
  beforeEach(() => {
    sendEmailSpy = sinon.stub(Email, 'sendEmailThroughAWS').returns([{
      sent: true
    }])
  });

  afterEach(async () => {
    sinon.restore();
  })

  describe('#send()', () => {
    it('should attempt to send an email', async () => {
      const req = mockRequest({
        query: {
          state: "{}"
        },
        body: {
          title: 'Hello',
          email: 'sample@email.com',
          name: 'sample name',
          project: 'sample project',
          message: 'sample message'
        }
      })
      const res = mockResponse()

      await EmailController.send(req, res)

      expect(sendEmailSpy).to.have.been.calledOnceWith(sinon.match({
        Source: 'community@merico.build',
        Destination: {
          ToAddresses: [
            'community@merico.build'
          ]
        }
      }))
    });
  });
});
