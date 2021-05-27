'use strict'
const User = require('./user')

const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class LoginAttempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      LoginAttempt.belongsTo(models.User)
    }
  }
  LoginAttempt.init({
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
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
    modelName: 'LoginAttempt'
  })
  return LoginAttempt
}
