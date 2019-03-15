const methods = require('./methods/class')
const instanceMethods = require('./methods/instance')

const manualCacheMethods = methods.manualCacheMethods
const classMethods = methods.classMethods

module.exports = function (client) {
  /* istanbul ignore next: covered, but depends on installed sequelize version */
  return {
    withCache (modelClass) {
      modelClass.cache = function () {
        return classMethods(client, this)
      }

      modelClass.manualCache = function (customId) {
        return manualCacheMethods(client, this, customId)
      }

      modelClass.prototype.cache = function () {
        return instanceMethods(client, this)
      }

      return modelClass
    },
    classMethods: {
      cache () { return classMethods(client, this) }
    },
    manualCacheMethods: {
      manualCache (customId) { return manualCacheMethods(client, this, customId) }
    },
    instanceMethods: {
      cache () { return instanceMethods(client, this) }
    }
  }
}
