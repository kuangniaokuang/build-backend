const chai = require('chai')
const { expect } = chai

const { refreshPriority } = require('../../api/util/priority')
const projectUtil = require('../../api/util/project')

describe ('priority.js', () => {
  describe ('refreshPriority', () => {
    it ('correctly calculates priority', async () => {
      const gitUrl = 'git://github.com/basicthinker/Sestet.git'
      const project = await projectUtil.findOne({ gitUrl })

      const priority = await refreshPriority(project)

      expect(priority).to.equal(581)
    })
  })
})
