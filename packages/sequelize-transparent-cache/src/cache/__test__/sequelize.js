const VariableAdaptor = require('../../../../sequelize-transparent-cache-variable')
const variableAdaptor = new VariableAdaptor()

const sequelizeCache = require('../..')

const Sequelize = require('sequelize')

const options = {
  logging: false,
  dialect: 'sqlite',
  define: {
    options: { paranoid: true }
  }
}

const sequelize = new Sequelize(options)

sequelize.define('User', {
  name: {
    allowNull: false,
    type: Sequelize.STRING
  }
})

sequelize.define('UserGroup', {
  user_id: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  group_id: {
    allowNull: false,
    type: Sequelize.INTEGER
  }
})

sequelize.define('Group', {
  name: {
    allowNull: false,
    type: Sequelize.STRING
  }
})

sequelize.define('Article', {
  uuid: {
    allowNull: false,
    type: Sequelize.STRING,
    primaryKey: true
  },
  title: {
    allowNull: false,
    type: Sequelize.STRING
  }
})

const { withCache } = sequelizeCache(variableAdaptor)
withCache(sequelize.models.User)
withCache(sequelize.models.Article)
withCache(sequelize.models.Group)

sequelize.model('User').hasMany(sequelize.model('Article'), { as: 'Articles' })
sequelize.model('Article').belongsTo(sequelize.model('User'), { as: 'Author' })
sequelize.model('User').belongsToMany(sequelize.model('Group'), {
  through: {
    model: sequelize.model('UserGroup'),
    unique: false
  },
  foreignKey: 'user_id',
  as: 'userGroups'
})
sequelize.model('Group').belongsToMany(sequelize.model('User'), {
  through: {
    model: sequelize.model('UserGroup'),
    unique: false
  },
  foreignKey: 'group_id',
  as: 'groupUsers'
})

module.exports = sequelize
