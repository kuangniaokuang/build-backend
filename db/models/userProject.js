'use strict'

const { Model } = require('sequelize')
const Project = require('./project')
const User = require('./user')

module.exports = (sequelize, DataTypes) => {
  class UserProject extends Model {
    static associate (models) {}
  }

  UserProject.init({
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      },
      allowNull: false,
      primaryKey: true
    },
    ProjectId: {
      type: DataTypes.INTEGER,
      references: {
        model: Project,
        key: 'id'
      },
      allowNull: false,
      primaryKey: true
    },
    isFavorite: {
      type: DataTypes.BOOLEAN
    },
    latestAnalysisId: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'UserProject',
    timestamps: false
  })

  return UserProject
}
