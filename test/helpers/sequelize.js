const VariableAdaptor = require('sequelize-transparent-cache-variable')
const variableAdaptor = new VariableAdaptor()

const sequelizeCache = require('../../lib')
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
