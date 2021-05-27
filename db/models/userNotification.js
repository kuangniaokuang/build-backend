'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../../api/util/ceQuery').connection()
const User = require('./user')(sequelize, DataTypes)

const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class UserNotification extends Model {
    static associate (models) {
      UserNotification.belongsTo(models.User, { targetKey: 'id', foreignKey: 'user' })
    }
  }
  UserNotification.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      },
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('badge', 'account', 'repository', 'generic'),
      allowNull: false,
      defaultValue: 'badge'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'UserNotification'
  })

  UserNotification.belongsTo(User, { targetKey: 'id', foreignKey: 'user' })
  return UserNotification
}
