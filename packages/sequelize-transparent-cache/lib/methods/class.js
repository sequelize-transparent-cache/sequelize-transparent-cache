const cache = require('../cache')

function classMethods (client, model) {
  return {
    client () {
      return client
    },
    create () {
      return model.create.apply(model, arguments)
      .then(instance => {
        return cache.save(client, instance)
      })
    },
    findByPk (id) {
      return cache.get(client, model, id)
      .then(instance => {
        if (instance) {
          return instance
        }

        return (model.findByPk || model.findById).apply(model, arguments)
        .then(instance => cache.save(client, instance))
      })
    },
    findById () {
      return this.findByPk.apply(this, arguments)
    },
    upsert (data) {
      return model.upsert.apply(model, arguments).then(created => {
        return cache.save(client, model.build(data))
        .then(() => created)
      })
    },
    insertOrUpdate () {
      return this.upsert.apply(this, arguments)
    }
  }
}

function manualCacheMethods (client, model, customKey) {
  return {
    client () {
      return client
    },
    findAll () {
      return cache.get(client, model, customKey)
        .then(instance => {
          if (instance) {
            return instance
          }
          return model.find.apply(model, arguments)
            .then(instance => cache.save(client, instance, customKey))
        })
    },
    find () {
      return this.findAll.apply(this, arguments)
    },
    clear () {
      return cache.clearKey(client, model, customKey)
    }
  }
}

module.exports = { classMethods, manualCacheMethods }
