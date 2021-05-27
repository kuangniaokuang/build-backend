const AWS = require('aws-sdk')
const config = require('../../config/env/resolveConfig')

const SESConfig = {
  apiVersion: '2010-12-01',
  accessKeyId: config.custom.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: config.custom.AWS_SES_SECRET_ACCESS_KEY,
  region: config.custom.AWS_SES_REGION
}

module.exports = {
  async sendEmailThroughAWS (params) {
    return await new AWS.SES(SESConfig).sendEmail(params).promise()
  },
  sendAnalysisCompleteEmail: async (email, projectName, projectLink) => {
    console.log('INFO >>> sendAnalysisCompleteEmail :: SENDING EMAIL for project, ', projectName)
    try {
      if (!email) {
        throw Error(`sendAnalysisCompleteEmail: No email to send to. Projectlink ${projectLink}`)
      }

      projectLink = `${config.custom.frontendBaseUrl}/repository/overview?gitUrl=${projectLink}`
      const subject = `Merico Build - Analysis Complete for ${projectName}`
      const html = `
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
        <div style="
        min-height: 418px;
        background: #F4F4F6;
        text-align:center;
        padding-top: 40px;">
        <a href="${config.custom.frontendBaseUrl}">
          <img src="https://open-to-web.s3-us-west-2.amazonaws.com/logo.png" width="58" height="37" alt="Merico Build - Logo"/>
        </a>
        <div style="padding:40px;text-align:center;margin: 30px auto 40px;
        background: #fff;border: 1px solid #C8C9D0;border-radius: 4px;
        max-width:800px;">
            <h1 style="margin: 0 0 40px;font-family: Source Sans Pro;
            font-style: normal;
            font-weight: 600;
            font-size: 24px;
            line-height: 1;
            text-align: center;">Your project has finished processing!</h1>
            <p style="font-family: Source Sans Pro;
            font-style: normal;
            font-weight: normal;
            font-size: 18px;
            line-height: 1.2;
            text-align: center;
            color: #4B4D58;">
              <a href="${projectLink}" style="text-decoration: none;color: #3d77dd; font-size:30px;">View results</a>
            </p>
        </div>
        <p style="
        font-family: Source Sans Pro;
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 1.25;
        text-align: center;
        color: #4B4D58;">
        You are receiving this email because you’ve used this email address to sign up for
        <a href="${config.custom.frontendBaseUrl}" style="text-decoration: none;color: #3d77dd;">Merico Build</a>.</p>
        </div>
      `

      const toArray = [email]
      await module.exports.sendEmail(subject, html, toArray)
      return { message: 'email sent' }
    } catch (error) {
      console.log('ERROR: sendAnalysisCompleteEmail', error)
      throw error
    }
  },
  async sendEmail (subject, html, toArray) {
    try {
      const params = {
        Source: 'community@merico.build',
        Destination: {
          ToAddresses: toArray
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: html
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject
          }
        }
      }

      const emailResults = await module.exports.sendEmailThroughAWS(params)
      return emailResults
    } catch (error) {
      if (process.env.NODE_ENV === 'benchmark' && error.message === 'Missing region in config') {
        return
      }

      throw error
    }
  },

  async sendContributorInvitationToMerico (email, message, inviterName, inviterEmail) {
    const subject = `Invitation to join Merico Build from ${inviterName}`
    console.log('INFO >>> sendContributorInvitationToMerico :: Sending invite for email, ', email)

    const html = `
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
      <div style="
      min-height: 418px;
      background: #F4F4F6;
      text-align:center;
      padding-top: 40px;">
      <a href="${config.custom.frontendBaseUrl}">
        <img src="https://open-to-web.s3-us-west-2.amazonaws.com/logo.png" width="58" height="37" alt="Merico Build - Logo"/>
      </a>
      <div style="padding:40px;text-align:center;margin: 30px auto 40px;
      background: #fff;border: 1px solid #C8C9D0;border-radius: 4px;
      max-width:800px;">
          <h1 style="margin: 0 0 40px;font-family: Source Sans Pro;
          font-style: normal;
          font-weight: 600;
          font-size: 24px;
          line-height: 1;
          text-align: center;">${inviterName} has invited you to join Merico Build</h1>
          <p style="font-family: Source Sans Pro;
          font-style: normal;
          font-weight: normal;
          font-size: 18px;
          line-height: 1.2;
          text-align: center;
          color: #4B4D58;">
            Their message to you: <br/><br/>
            ${message}
            <br/><br/>
            <a href="${config.custom.frontendBaseUrl}">
              Click here to sign up
            </a>
          </p>
      </div>
      <p style="
      font-family: Source Sans Pro;
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 1.25;
      text-align: center;
      color: #4B4D58;">
      You are receiving this email because ${inviterName} <${inviterEmail}> invited you to join <a href="${config.custom.frontendBaseUrl}">Merico Build</a>
      </div>
    `

    await module.exports.sendEmail(subject, html, [email])

    return true
  }
}
