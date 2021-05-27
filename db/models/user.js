'use strict'
const Encryption = require('../../api/util/encryption')

const {
  Model
} = require('sequelize')

const encryptUserTokens = (user) => {
  user.githubAccessToken = Encryption.encrypt(user.githubAccessToken)
  user.githubRefreshToken = Encryption.encrypt(user.githubRefreshToken)
  user.gitlabAccessToken = Encryption.encrypt(user.gitlabAccessToken)
  user.gitlabRefreshToken = Encryption.encrypt(user.gitlabRefreshToken)
  return user
}

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate (models) {
      User.hasMany(models.UserEmail, {
        onDelete: 'cascade'
      })
      User.hasMany(models.LoginAttempt, {
        onDelete: 'cascade'
      })
      User.belongsToMany(models.Project, {
        through: models.UserProject
      })
    }
  }

  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    photo: DataTypes.STRING,
    displayName: DataTypes.STRING,
    gitlabUsername: DataTypes.STRING,
    githubUsername: DataTypes.STRING,
    githubApiUrl: DataTypes.STRING,
    githubAccessToken: DataTypes.JSON,
    githubRefreshToken: DataTypes.JSON,
    gitlabAccessToken: DataTypes.JSON,
    gitlabRefreshToken: DataTypes.JSON,
    website: DataTypes.STRING,
    isOnboarded: DataTypes.BOOLEAN,
    isPublic: DataTypes.BOOLEAN,
    primaryEmail: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    defaultScope: {
      attributes: { exclude: ['githubAccessToken', 'githubRefreshToken', 'gitlabAccessToken', 'gitlabRefreshToken'] }
    },
    hooks: {
      beforeCreate: (user, options) => {
        user = encryptUserTokens(user)
        return user
      },
      beforeUpdate: (user, options) => {
        user = encryptUserTokens(user)
        return user
      }
    },
    sequelize,
    modelName: 'User'
  })

  return User
}
