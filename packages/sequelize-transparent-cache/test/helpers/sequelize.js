const VariableAdaptor = require('sequelize-transparent-cache-variable')
const variableAdaptor = new VariableAdaptor()

const sequelizeCache = require('../../lib')

const Sequelize = require('sequelize')

if (Sequelize.version.startsWith('3')) {
  console.warn('Running test using sequelize v3')
  const { classMethods, instanceMethods } = sequelizeCache(variableAdaptor)

  const Sequelize = require('sequelize')
  const sequelize = new Sequelize({
    logging: false,
    dialect: 'sqlite',
    define: {
      options: { paranoid: true },
      classMethods,
      instanceMethods
    }
  })

  sequelize.define('User', {
    name: {
      allowNull: false,
      type: Sequelize.STRING
    }
  })

  module.exports = sequelize
}

if (Sequelize.version.startsWith('4')) {
  console.warn('Running test using sequelize v4')
  const { withCache } = sequelizeCache(variableAdaptor)

  const sequelize = new Sequelize({
    logging: false,
    dialect: 'sqlite',
    define: {
      options: { paranoid: true }
    }
  })

  sequelize.define('User', {
    name: {
      allowNull: false,
      type: Sequelize.STRING
    }
  })

  withCache(sequelize.models.User)

  module.exports = sequelize
}
