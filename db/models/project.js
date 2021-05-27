'use strict'

const {
  Model
} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate (models) {
      Project.belongsToMany(models.User, { through: models.UserProject })
    }
  }
  Project.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gitUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        validGitUrl (value) {
          if (!value.startsWith('git://github') && !value.startsWith('https://gitlab.com')) {
            throw new Error('gitUrl must start with either git://github or https://gitlab.com')
          }

          if (!value.endsWith('.git')) {
            throw new Error('gitUrl must end with .git')
          }
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eeLastSyncTime: {
      type: DataTypes.DATE
    },
    eeProjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    eeStatus: {
      type: DataTypes.STRING
    },
    latestCommitHash: {
      type: DataTypes.STRING
    },
    latestCommitTitle: {
      type: DataTypes.STRING
    },
    latestCommitMessage: {
      type: DataTypes.STRING
    },
    nextProcessing: {
      type: DataTypes.DATE
    },
    incomingReportId: {
      type: DataTypes.UUID
    },
    latestReportId: {
      type: DataTypes.UUID
    },
    priority: {
      type: DataTypes.INTEGER
    },
    latestProtobuf: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Project'
  })

  return Project
}
