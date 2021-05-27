const _ = require('lodash')
const { Op } = require('sequelize')
const {
  v4: uuidv4
} = require('uuid')

const {
  PendingVerification,
  User
} = require('../../db/models')
const config = require('../../config/env/resolveConfig')
const jwt = require('jsonwebtoken')
const Email = require('../util/email')
const githubUtil = require('../util/github')

module.exports = {
  // THIS METHOD IS DEPRECATED BUT WE WILL LIKELY NEED IT IN THE FUTURE
  verifyEmailVerificationCode: async (req, res) => {
    // check the query params sent from the users email > users browser > here
    const user = JSON.parse(Buffer.from(req.query.user, 'base64').toString('ascii'))
    const email = req.query.email
    const redirectBaseUrl = req.query.redirectBaseUrl || config.custom.frontendBaseUrl
    const token = req.query.token
    if (!token && email) {
      return res.status(500).send({
        message: 'You must provide a token and an email'
      })
    }
    try {
      // Make sure record exists in Pending verifications
      const pendingVerification = await PendingVerification.findOne({
        where: {
          token,
          email
        }
      })
      if (pendingVerification) {
        // Create user record
        // this cereated User does not have an email
        await User.findOrCreate({
          where: {
            [Op.or]: [{
              githubUsername: user.githubUsername || ''
            }, {
              gitlabUsername: user.gitlabUsername || ''
            }]
          },
          defaults: user
        })

        await githubUtil.addEmailsToUser(user)

        await User.update({ primaryEmail: email }, { where: { githubUsername: user.githubUsername } })
        // Remove all pending verification records for this user
        await PendingVerification.destroy({
          where: {
            email
          }
        })
        // Redirect to the proper Front end url
        const authToken = jwt.sign(user, config.custom.ENCRYPTION_KEY)
        res.redirect(`${redirectBaseUrl}/onboarding/emailVerified?email=${email}&token=${authToken}`)
      } else {
        console.error('ERROR: user could not be verified', email)
        return res.status(500).send({
          message: 'Validation token has expired'
        })
      }
    } catch (error) {
      console.log('ERROR: verifyEmailVerificationCode', error)
      return res.status(500).send('Could not verify email or the user already exists in our system')
    }
  },

  // THIS METHOD IS DEPRECATED BUT WE WILL LIKELY NEED IT IN THE FUTURE
  sendVerificationEmail: async (req, res) => {
    const user = req.body.user
    const email = req.body.email || req.query.email
    try {
      // Create a verification code from a simple uuid
      const token = uuidv4()
      // create a Pending Verification record
      await PendingVerification.create({
        email,
        token
      })
      const verificationLink = `${config.custom.apiBaseUrl}/verifyEmailVerificationCode?token=${token}&email=${email}&user=${Buffer.from((JSON.stringify(user))).toString('base64')}`

      const subject = 'Merico Build - Please verify your email'
      const html = `
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
        <div style="
        min-height: 418px;
        background: #F4F4F6;
        text-align:center;
        padding-top: 40px;">
        <a href="${config.custom.frontendBaseUrl}">
          <img src="${config.custom.frontendBaseUrl}/logo.svg" width="58" height="37" alt="Merico Build - Logo"/>
        </a>
        <div style="padding:40px;text-align:center;margin: 30px auto 40px;
        background: #fff;border: 1px solid #C8C9D0;border-radius: 4px;
        max-width:800px;">
            <h1 style="margin: 0 0 40px;font-family: Source Sans Pro;
            font-style: normal;
            font-weight: 600;
            font-size: 24px;
            line-height: 1;
            text-align: center;">Thank you for signing up for Merico Build!</h1>
            <p style="font-family: Source Sans Pro;
            font-style: normal;
            font-weight: normal;
            font-size: 18px;
            line-height: 1.2;
            text-align: center;
            color: #4B4D58;">
              Please click on the link below to verify your email<br /><br />
              <a href="${verificationLink}" style="text-decoration: none;color: #3d77dd;">Confirm my email</a>
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
      // send to the correct backend url based on the environment config
      // send email with verification code that matches the email address
      await Email.sendEmail(subject, html, toArray)
      return res.status(200).send({
        message: 'email sent'
      })
    } catch (error) {
      console.log('ERROR: Verify Email', error)
      return res.status(500).send(error)
    }
  },

  send: async (req, res) => {
    try {
      const subject = 'Contact us feedback - ' + req.body.title
      const html = `
        <h1>${_.escape(req.body.title)}</h1>
        <strong>Email:</strong> ${_.escape(req.body.email)}</br>
        <strong>Name:</strong> ${_.escape(req.body.name)}</br>
        <strong>Project:</strong> ${_.escape(req.body.project)}</br>
        <strong>Message:</strong><br />
        ${_.escape(req.body.message)}
      `
      const toArray = [
        'community@merico.build'
      ]
      await Email.sendEmail(subject, html, toArray)
      return res.status(200).send({
        message: 'email sent'
      })
    } catch (error) {
      console.log('ERROR: EmailSend', error)
      return res.status(500).send(error)
    }
  }
}
