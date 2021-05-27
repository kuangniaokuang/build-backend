'use strict'
const { DataTypes } = require('sequelize')
const sequelize = require('../../api/util/ceQuery').connection()
const User = require('./user')(sequelize, DataTypes)

const {
  Model
} = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class BaselineRepoMeta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate () {
    }
  }
  BaselineRepoMeta.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    user: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    email: DataTypes.STRING,
    gitUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userCommits: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    totalCommits: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    totalCommitters: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    forked: DataTypes.BOOLEAN,
    repoSize: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'BaselineRepoMeta'
  })

  User.hasMany(BaselineRepoMeta, {
    onDelete: 'CASCADE',
    foreignKey: 'user',
    targetKey: 'id'
  })
  BaselineRepoMeta.belongsTo(User, { targetKey: 'id', foreignKey: 'user' })

  return BaselineRepoMeta
}
