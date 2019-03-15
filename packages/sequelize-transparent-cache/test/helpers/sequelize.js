const VariableAdaptor = require('sequelize-transparent-cache-variable')
const variableAdaptor = new VariableAdaptor()

const sequelizeCache = require('../../lib')

const Sequelize = require('sequelize')

const options = {
  logging: false,
  dialect: 'sqlite',
  define: {
    options: { paranoid: true }
  }
}

if (Sequelize.version.startsWith('3')) { // Using global define
  const { instanceMethods, classMethods, manualCacheMethods } = sequelizeCache(variableAdaptor)
  options.define.instanceMethods = instanceMethods
  options.define.classMethods = classMethods
  options.define.manualCacheMethods = manualCacheMethods
}

const sequelize = new Sequelize(options)

sequelize.define('User', {
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

sequelize.define('Comment', {
  userId: {
    allowNull: false,
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  articleUuid: {
    allowNull: false,
    type: Sequelize.STRING,
    primaryKey: true
  },
  body: {
    allowNull: false,
    type: Sequelize.STRING
  }
})

if (Sequelize.version.startsWith('4')) { // Using class extention
  const { withCache } = sequelizeCache(variableAdaptor)
  withCache(sequelize.models.User)
  withCache(sequelize.models.Article)
  withCache(sequelize.models.Comment)
}

sequelize.model('User').hasMany(sequelize.model('Article'), { as: 'Articles' })
sequelize.model('Article').belongsTo(sequelize.model('User'), { as: 'User' })

module.exports = sequelize
