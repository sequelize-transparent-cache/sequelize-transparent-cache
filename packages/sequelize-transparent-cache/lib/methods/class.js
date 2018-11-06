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

module.exports = classMethods
