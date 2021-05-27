const chai = require('chai')
const { expect } = chai

const Factory = require('../../factory')
const mockObjects = require('../../util/mockObjects')

describe ('Project Model', () => {
  afterEach(async () => {
    await Factory.destroyAll()
  })

  it ('will throw an exception if we try to create a project with an unacceptable gitUrl', async () => {
    const projectProperties = mockObjects.models.project()
    projectProperties.gitUrl = 'git://gitlab.com/my-name/my-project.git'

    try {
      await Factory.createProject(1, projectProperties)
      expect(false).to.be.true // create project should fail, so we never want to get to this line, hence the expect that will always fail
    } catch (error) {
      expect(error.message).to.equal('Validation error: gitUrl must start with either git://github or https://gitlab.com')
    }
  })

  it ('will throw an exception if our gitUrl does not end with .git', async () => {
    const projectProperties = mockObjects.models.project()
    projectProperties.gitUrl = 'https://gitlab.com/my-name/my-project-but-no-git'

    try {
      await Factory.createProject(1, projectProperties)
      expect(false).to.be.true // create project should fail, so we never want to get to this line, hence the expect that will always fail
    } catch (error) {
      expect(error.message).to.equal('Validation error: gitUrl must end with .git')
    }
  })
})
