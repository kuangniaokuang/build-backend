'use strict'

const { DataTypes } = require('sequelize')
const sequelize = require('../../api/util/ceQuery').connection()
const User = require('./user')(sequelize, DataTypes)
const Project = require('./project')(sequelize, DataTypes)
const BadgeType = require('./badgeType')(sequelize, DataTypes)

const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Badge extends Model {
    static associate (models) {
      Badge.belongsTo(models.Project, { targetKey: 'id', foreignKey: 'project', constraints: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true })
      Badge.belongsTo(models.BadgeType, { targetKey: 'code', foreignKey: 'type', constraints: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
      Badge.belongsTo(models.User, { targetKey: 'id', foreignKey: 'user', constraints: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
  }
  Badge.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      references: {
        model: BadgeType,
        key: 'code'
      },
      allowNull: false
    },
    grade: {
      type: DataTypes.ENUM('GOLD', 'SILVER', 'BRONZE', 'IRON', 'NONE'),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rankNumerator: {
      type: DataTypes.STRING
    },
    rankDenominator: {
      type: DataTypes.STRING
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    current: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      },
      allowNull: false
    },
    project: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Project,
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
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Badge'
  })
  // @todo Issue #372 - We need to properly implement sequelize "Hooks" to Nullify PROJECT FK Colum on Badges BEFORE a Project gets deleted.
  // For now, this belongsTo relationship will provide the included model on /badges API Endpoint.
  Badge.belongsTo(Project, { targetKey: 'id', foreignKey: 'project', constraints: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true })
  // Badge Types
  Badge.belongsTo(BadgeType, { targetKey: 'code', foreignKey: 'type', constraints: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // User
  Badge.belongsTo(User, { targetKey: 'id', foreignKey: 'user', constraints: false, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true })

  return Badge
}
