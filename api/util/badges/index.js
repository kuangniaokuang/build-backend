const { Op } = require('sequelize')

const projectUtil = require('../project')
const { Badge, User, UserEmail } = require('../../../db/models')
const trailblazerUtil = require('./trailblazer')
const linguistUtil = require('./linguist')
const multilingualUtil = require('./multilingual')
const contributionUtil = require('./contribution')
const topContributorUtil = require('./topContributor')
const minesweeperUtil = require('./mineSweeper')
const testOfTimeUtil = require('./testOfTime')
const gotStarted = require('./gotStarted')

const findOneUserWithBadges = async (where) => {
  try {
    let user = await User.findOne({
      where,
      include: [{
        model: UserEmail
      }]
    })
    user = user.dataValues
    const badges = await Badge.findAll({
      where: {
        user: user.id
      }
    })
    user.badges = badges
    return user
  } catch (error) {
    throw new Error(error)
  }
}
module.exports = {
  analysisComplete: async (eeProjectId) => {
    try {
      // TODO: we shouldn't depend on projectUtil in this file,
      // instead, pass the user and projectId into this function

      const project = await projectUtil.findOne({
        eeProjectId
      })

      const users = project.get('Users')

      for (let i = 0; i < users.length; i++) {
        const user = users[i].dataValues
        // TODO: why do we do this? Can we not do it at the user model level?
        user.emails = user.UserEmails.map((email) => {
          return email.dataValues.email
        })

        const linguistBadges = await linguistUtil.generateBadges(user)
        multilingualUtil.generateBadges(user, linguistBadges)
        trailblazerUtil.generateBadges(user, project.id, eeProjectId)
        topContributorUtil.generateBadges(user, project.id, eeProjectId)
        contributionUtil.generateBadges(user, project.id, eeProjectId)
        minesweeperUtil.generateBadges(user, project.id, eeProjectId)
        testOfTimeUtil.generateBadges(user, project.id, eeProjectId)
      }
    } catch (error) {
      console.error('ERROR: sdjhfd8yf7yfe: ', error)
      throw error
    }
  },
  generateGlobalBadges: async (projectId, userId) => {
    const user = await User.findOne({
      where: {
        id: userId
      },
      include: [{
        model: UserEmail
      }]
    })

    // TODO: why do we do this? Can we not do it at the user model level?
    user.emails = user.UserEmails.map((email) => {
      return email.dataValues.email
    })

    const linguistBadges = await linguistUtil.generateBadges(user)
    multilingualUtil.generateBadges(user, linguistBadges)
  },
  regenerateAllBadgesForUser: async (userId) => {
    try {
      const user = await findOneUserWithBadges({
        id: userId
      })

      // TODO: why do we do this? Can we not do it at the user model level?
      user.emails = user.UserEmails.map((email) => {
        return email.dataValues.email
      })

      const projects = await projectUtil.getAllByUserId(userId)

      if (projects.length) {
        const linguistBadges = await linguistUtil.generateBadges(user)
        multilingualUtil.generateBadges(user, linguistBadges)

        projects.forEach(project => {
          trailblazerUtil.generateBadges(user, project.id, project.eeProjectId)
          topContributorUtil.generateBadges(user, project.id, project.eeProjectId)
          contributionUtil.generateBadges(user, project.id, project.eeProjectId)
          minesweeperUtil.generateBadges(user, project.id, project.eeProjectId)
          testOfTimeUtil.generateBadges(user, project.id, project.eeProjectId)
        })
      }
    } catch (error) {
      console.log('Failed to regenerate all badges for user', error)
      throw error
    }
  },
  createGotStartedBadge: async (user) => {
    await gotStarted.generateBadges(user)
  },
  deleteProjectSpecificBadges: async (projectId, userId) => {
    try {
      await Badge.destroy({
        where: {
          user: userId,
          project: projectId,
          type: {
            [Op.notIn]: ['linguist', 'multilingual']
          }
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },
  update: async (updatedBadge, badgeId) => {
    try {
      return await Badge.update(updatedBadge, {
        where: {
          id: badgeId
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },
  count: async (userId) => {
    try {
      return await Badge.count({
        where: {
          user: userId
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  },
  getAll: async () => {
    try {
      return await Badge.findAll()
    } catch (error) {
      throw new Error(error)
    }
  },
  getAllByUser: async (userId) => {
    try {
      const badges = await Badge.findAll({
        where: {
          user: userId
        },
        include: [{
          all: true
        }],
        order: [['id', 'ASC']]
      })
      return badges
    } catch (error) {
      throw new Error(error)
    }
  },
  getAllByUserAndType: async (
    userId,
    type,
    sortColumn = 'id',
    sortDirection = 'desc',
    limit
  ) => {
    try {
      const params = {
        where: {
          user: userId,
          type
        },
        include: [{
          all: true
        }],
        order: [
          [sortColumn, sortDirection]
        ]
      }

      if (limit) {
        params.limit = limit
      }

      const badges = await Badge.findAll(params)
      return badges
    } catch (error) {
      throw new Error(error)
    }
  },
  findOne: async (badgeId) => {
    try {
      const oneBadge = await Badge.findOne({
        where: {
          id: badgeId
        },
        include: [{
          all: true
        }]
      })
      return oneBadge
    } catch (error) {
      throw new Error(error)
    }
  },
  deleteAllByUser: async (user) => {
    try {
      await Badge.destroy({
        where: {
          user: user.id || user
        }
      })
    } catch (error) {
      throw new Error(error)
    }
  }
}
