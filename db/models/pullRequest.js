'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../../api/util/ceQuery').connection()
const Contributor = require('./contributor')(sequelize, DataTypes)
const User = require('./user')(sequelize, DataTypes)
const Project = require('./project')(sequelize, DataTypes)

const {
  Model
} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class PullRequest extends Model {
    static associate (models) {
    }
  }

  PullRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    remoteId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    apiUrl: {
      allowNull: false,
      type: DataTypes.STRING
    },
    state: {
      allowNull: false,
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING
    },
    project: {
      type: DataTypes.UUID,
      references: {
        model: Project,
        key: 'eeProjectId'
      },
      allowNull: false
    },
    author: {
      type: DataTypes.INTEGER,
      references: {
        model: Contributor,
        key: 'id'
      }
    },
    user: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    provider: {
      type: DataTypes.ENUM('github', 'gitlab'),
      allowNull: false,
      primaryKey: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    closedAt: {
      type: DataTypes.DATE
    },
    mergedAt: {
      type: DataTypes.DATE
    },
    mergeCommit: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    underscored: true,
    modelName: 'PullRequest'
  })

  return PullRequest
}
