const { UserEmail } = require('../../db/models')
const verifyToken = require('../util/verifyToken')

const getEmailsArrayFromUser = async (user) => {
  // We use this is a helper array to get the emails as strings and not objects
  const userEmails = user.dataValues.UserEmails.map(userEmail => {
    return userEmail.email
  })

  // In the case of an error where the user's emails have been compromised
  if (!userEmails.includes(user.primaryEmail)) {
    userEmails.push(user.primaryEmail)
    await UserEmail.create({
      email: user.primaryEmail,
      UserId: user.id,
      isVerified: false
    })
  }

  // There are situations where the userEmail is not set properly and we have to fall back to the primary email
  return userEmails
}

module.exports = (req, res, next) => {
  verifyToken.getUserFromToken(req, res, async (error, foundUser) => {
    if (error) {
      return res.status(401).send('ERROR: xnbb86b5: A problem occurred verifying the token')
    }
    if (!foundUser.id) {
      return res.status(401).send('ERROR: xnbsdf5: User not found')
    }

    res.locals.user = foundUser.dataValues
    req.user = foundUser.dataValues
    try {
      req.user.emails = await getEmailsArrayFromUser(foundUser)
      return next()
    } catch (error) {
      console.error('ERROR: fdh83he: getUserFromToken', error)
    }
  })
}
