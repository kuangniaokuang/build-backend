'use strict'

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Contributor extends Model {
    static associate (models) {}
  }

  Contributor.init({
    email: {
      type: DataTypes.INTEGER
    },
    userId: DataTypes.INTEGER,
    remoteId: {
      type: DataTypes.INTEGER
    },
    username: DataTypes.STRING,
    displayName: DataTypes.STRING,
    profileUrl: DataTypes.STRING,
    photoUrl: DataTypes.STRING,
    provider: {
      type: DataTypes.ENUM('github', 'gitlab')
    }
  }, {
    sequelize,
    underscored: true,
    modelName: 'Contributor'
  })

  return Contributor
}
