const qb = require('../util/queryBuilder')
const eeQuery = require('../util/eeQuery')
const projectUtil = require('./project')
const { User } = require('../../db/models')

const getExtraProjectDetails = async (repos, userEmails) => {
  const eeProjectIds = repos.map(repo => repo.eeProjectId)
  const query = qb.getProjectDetailsForMultipleProjectIds(eeProjectIds, userEmails)

  const results = await eeQuery.execute(query.sql, query.values)

  return results[0].length
    ? results[0]
    : ''
}

const mergeProjectsWithExtraDetails = (projects, extraDetails) => {
  return projects.map(repo => {
    const extraProjectData = extraDetails.find(projectData => {
      return projectData.id === repo.get('id')
    })

    return {
      ...extraProjectData,
      ...repo.dataValues,
      isFavorite: repo.get('Users')[0].get('UserProject').get('isFavorite')
    }
  })
}

module.exports = {
  getUserProjectsWithEEData: async (user, offset, limit, sortColumn = 'name', sortDirection = 'ASC', isFavorite) => {
    const options = {
      include: [{
        model: User,
        where: { id: user.id }
      }]
    }

    if (isFavorite) {
      options[0].include.through = { where: { isFavorite } }
    }

    if (offset !== null && limit) {
      options.offset = offset
      options.limit = limit
    }

    if (sortColumn && sortDirection) {
      // TODO: rename this column to match EE
      if (sortColumn === 'lastSyncTime') {
        sortColumn = 'eeLastSyncTime'
      }
      options.order = [[sortColumn, sortDirection]]
    }

    const { rows: repos, count } = await projectUtil.findAndCountAll(options)

    const extraProjectDataResults = await getExtraProjectDetails(repos, user.emails)

    return {
      projects: mergeProjectsWithExtraDetails(repos, extraProjectDataResults),
      totalRecords: count
    }
  }
}
