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
  const { instanceMethods, classMethods } = sequelizeCache(variableAdaptor)
  options.define.instanceMethods = instanceMethods
  options.define.classMethods = classMethods
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

sequelize.model('User').hasMany(sequelize.model('Comment'), { as: 'Comments' })
sequelize.model('Article').hasMany(sequelize.model('Comment'), { as: 'Comments' })
sequelize.model('Comment').belongsTo(sequelize.model('User'), { as: 'User' })
sequelize.model('Comment').belongsTo(sequelize.model('Article'), { as: 'Article' })

module.exports = sequelize
