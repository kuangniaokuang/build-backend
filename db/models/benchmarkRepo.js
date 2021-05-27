'use strict'
const {
  Model
} = require('sequelize')
const User = require('./user')
const Project = require('./project')

module.exports = (sequelize, DataTypes) => {
  class BenchmarkRepo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      models.User.hasMany(BenchmarkRepo, {
        onDelete: 'CASCADE'
      })
      BenchmarkRepo.belongsTo(models.User)
    }
  }
  BenchmarkRepo.init({
    language: DataTypes.STRING,
    repoUrl: {
      field: 'repo_url',
      type: DataTypes.STRING
    },
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    projectId: {
      field: 'project_id',
      type: DataTypes.INTEGER,
      references: {
        model: Project,
        key: 'id'
      }
    },
    eeProjectId: {
      field: 'ee_project_id',
      type: DataTypes.STRING
    },
    reportId: {
      field: 'report_id',
      type: DataTypes.STRING
    },
    skipped: DataTypes.BOOLEAN,
    notes: DataTypes.STRING,
    analysisId: {
      field: 'analysis_id',
      type: DataTypes.STRING
    },
    analysisStatus: {
      field: 'analysis_status',
      type: DataTypes.STRING
    },
    stars: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BenchmarkRepo',
    tableName: 'benchmark_repos'
  })

  return BenchmarkRepo
}
