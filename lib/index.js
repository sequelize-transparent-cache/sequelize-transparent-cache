const classMethods = require('./methods/class')
const instanceMethods = require('./methods/instance')

module.exports = function (client) {
  return {
    classMethods: {
      cache () {
        return classMethods(client, this)
      }
    },
    instanceMethods: {
      cache () {
        return instanceMethods(client, this)
      }
    }
  }
}
