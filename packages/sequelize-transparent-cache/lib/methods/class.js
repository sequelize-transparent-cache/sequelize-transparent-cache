const cache = require('../cache')

function buildAutoMethods(client, model) {
  return {
    client() {
      return client
    },
    create() {
      return model.create.apply(model, arguments)
        .then(instance => {
          return cache.save(client, instance)
        })
    },
    findByPk(id) {
      return cache.get(client, model, id)
        .then(instance => {
          if (instance) {
            return instance
          }

          return (model.findByPk || model.findById).apply(model, arguments)
            .then(instance => cache.save(client, instance))
        })
    },
    findById() {
      return this.findByPk.apply(this, arguments)
    },
    upsert(data) {
      return model.upsert.apply(model, arguments).then(created => {
        return cache.save(client, model.build(data))
          .then(() => created)
      })
    },
    insertOrUpdate() {
      return this.upsert.apply(this, arguments)
    }
  }
}

function buildManualMethods(client, model, customKey) {
  return {
    client() {
      return client
    },
    findAll() {
      return cache.getAll(client, model, customKey)
        .then(instances => {
          if (instances) { // any array - cache hit
            return instances
          }

          return model.findAll.apply(model, arguments)
            .then(instances => cache.saveAll(client, model, instances, customKey))
        })
    },
    findOne() {
      return cache.get(client, model, customKey)
        .then(instance => {
          if (instance) {
            return instance
          }

          return model.findOne.apply(model, arguments)
            .then(instance => cache.save(client, instance, customKey))
        })
    },
    clear() {
      return cache.clearKey(client, model, customKey)
    }
  }
}

module.exports = { auto: buildAutoMethods, manual: buildManualMethods }
