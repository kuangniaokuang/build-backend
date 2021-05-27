const { User, Project, UserEmail, UserNotification, Badge, LoginAttempt, Contributor, PullRequest } = require('../../db/models')
const mockObjects = require('../util/mockObjects')

module.exports = {
  createdStuff: {
    users: [],
    contributors: [],
    pullRequests: []
  },

  async destroyAll() {
    await this.destroyPullRequests()
    await this.destroyCreatedUsers()
    await this.destroyCreatedContributors()
  },

  async destroyCreatedUsers() {
    for (let i = 0; i < this.createdStuff.users.length; i++) {
      const user = this.createdStuff.users[i]

      await this.destroyLoginAttemptsForUser(user)
      await this.destroyBadgesForUser(user)
      await this.destroyProjectsForUser(user)
      await this.destroyUserEmail(user)
      await this.destroyUserNotifications(user)
      await user.setProjects([])
      await user.destroy()
    }
  },

  async destroyLoginAttemptsForUser(user) {
    await LoginAttempt.destroy({
      where: {
        UserId: user.id,
      },
    })
  },

  async destroyBadgesForUser(user) {
    await Badge.destroy({
      where: {
        user: user.id,
      },
    })
  },

  async destroyProjectsForUser(user) {
    const projects = await user.getProjects()

    for (let i = 0; i < projects.length; i++) {
      const project = projects[0]

      // there has got to be a better way to delete projects with many to many relationships
      await project.setUsers([])
      await project.destroy()
    }
  },

  async destroyUserEmail(user) {
    await UserEmail.destroy({
      where: {
        UserId: user.id,
      },
    })
  },

  async destroyUserNotifications(user) {
    await UserNotification.destroy({
      where: {
        user: user.id,
      },
    })
  },

  async destroyPullRequests () {
    for (let i = 0; i < this.createdStuff.pullRequests.length; i++) {
      const pr = this.createdStuff.pullRequests[i]
      await pr.destroy()
    }
  },

  async destroyCreatedContributors() {
    for (let i = 0; i < this.createdStuff.contributors.length; i++) {
      const contributor = this.createdStuff.contributors[i]
      await contributor.destroy()
    }
  },

  async createUserWithManyBadges(count=5, userToCreate){
    try {
      let user = await this.createUser(userToCreate)
      let promises = []
      for(let i = 0; i < count; i++){
        promises.push(this.createBadge(user))
      }
      await Promise.all(promises)
      return user

    } catch (error) {
      console.error('ERROR: createUserWithManyBadges: ', error)
      throw error
    }
  },

  async createUserWithProject(usertoCreate, projectToCreate) {
    try {
      let user = await this.createUser(usertoCreate)
      let project = await this.createProject(user.id, projectToCreate)

      return {user, project}
    } catch (error) {
      console.error('ERROR: factory createUserWithProject: ', error)
      throw error
    }
  },

  async createUser(userToCreate = mockObjects.models.user()) {
    try {
      const user = await User.create(userToCreate)
      await this.createUserEmail(user)

      this.createdStuff.users.push(user)

      return user
    } catch (error) {
      console.error('ERROR: factory createUser: ', error)
      throw error
    }
  },

  async createUserEmail(user) {
    const userEmail = await UserEmail.create({
      email: user.primaryEmail,
      UserId: user.id,
      isVerified: false,
    })

    return userEmail
  },

  async createProject(userId, project = mockObjects.models.project()) {
    createdProject = await Project.create(project)

    await createdProject.addUser(userId)

    return createdProject
  },

  async createNotification(userId, notification = mockObjects.models.notification()) {
    notification = {
      ...notification,
      user: userId
    }

    return await UserNotification.create(notification)
  },

  async createBadge(user) {
    let project = await this.createProject(user.dataValues.id)
    let badge = mockObjects.models.badge()
    badge = {
      ...badge,
      project: project.dataValues.id,
      user: user.dataValues.id
    }
    createdbadge = await Badge.create(badge)

    return createdbadge
  },

  async createContributor() {
    const contributor = await Contributor.create(mockObjects.models.contributor())
    this.createdStuff.contributors.push(contributor)

    return contributor
  },

  async createPullRequest(projectId, contributorId) {
    const pullRequest = await PullRequest.create(mockObjects.models.pullRequest(projectId, contributorId))
    this.createdStuff.pullRequests.push(pullRequest)

    return pullRequest
  }
}
