const sinon = require('sinon')
const chai = require('chai')
const { expect } = chai
const sinonChai = require('sinon-chai')

const email = require('../../../../api/util/email')

chai.use(sinonChai)

describe('email', () => {
  it ('sends an analysis complete email', async () => {
    sinon.stub(email, 'sendEmailThroughAWS').resolves('we sent the email through aws')

    const results = await email.sendAnalysisCompleteEmail('test@example.com', 'awesome-project-name', 'https://github.com/test/awesome-project-name')

    expect(results.message).to.equal('email sent')
  })
})
