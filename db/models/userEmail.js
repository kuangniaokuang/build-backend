'use strict'
const User = require('./user')

const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class UserEmail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      models.User.hasMany(UserEmail, {
        onDelete: 'CASCADE'
      })
      UserEmail.belongsTo(models.User)
    }
  }
  UserEmail.init({
    email: {
      type: DataTypes.STRING,
      isEmail: true,
      allowNull: false,
      notEmpty: true
    },
    isVerified: DataTypes.BOOLEAN,
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserEmail'
  })
  return UserEmail
}
