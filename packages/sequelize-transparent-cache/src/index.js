const buildClassMethods = require('./methods/class')
const buildInstanceMethods = require('./methods/instance')

module.exports = (client) => ({
  withCache(modelClass) {
    modelClass.cache = function (customId, options) {
      return customId
        ? buildClassMethods.manual(client, this, { customKey: customId, ...options })
        : buildClassMethods.auto(client, this, options)
    }

    modelClass.prototype.cache = function () {
      return buildInstanceMethods(client, this)
    }

    return modelClass
  },
})
