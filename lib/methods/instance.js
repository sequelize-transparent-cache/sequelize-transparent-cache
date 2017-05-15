const cache = require('../cache')

function instanceMethods (client, instance) {
  return {
    client () {
      return client
    },
    save () {
      return instance.save.apply(instance, arguments)
      .then(instance => cache.save(client, instance))
    },

    update () {
      return instance.update
        .apply(instance, arguments)
        .then(instance => cache.save(client, instance))
    },

    destroy () {
      return instance.destroy.apply(instance, arguments)
      .then(() => cache.destroy(client, instance))
    }
  }
}

module.exports = instanceMethods
