import { Model } from 'sequelize'
import * as cache from '../cache'

export function autoClassMethods<M extends typeof Model & { new (): M } & typeof Model> (client: cache.Client, model: M) {
  const proxiedMethods: Pick<M, 'create' | 'findByPk' | 'upsert'> & { insertOrUpdate: M['upsert'] } = {
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

          return model.findByPk.apply(model, arguments)
            .then(instance => cache.save(client, instance))
        })
    },
    upsert (data) {
      return model.upsert.apply(model, arguments).then(created => {
        return cache.destroy(client, model.build(data))
          .then(() => created)
      })
    },
    insertOrUpdate () {
      return this.upsert.apply(this, arguments)
    }
  }

  return {
    ...proxiedMethods,
    client () {
      return client
    }
  }
}

export function manualClassMethods<M extends typeof Model & { new (): M }> (client: cache.Client, model: M, customKey: string) {
  const proxiedMethods: Pick<M, 'findAll' | 'findOne'> = {
    findAll () {
      return cache.getAll(client, model, customKey)
        .then(instances => {
          if (instances) { // any array - cache hit
            return instances
          }

          return model.findAll.apply(model, arguments)
            .then(instances => cache.saveAll(client, model, instances, customKey))
        })
    },
    findOne () {
      return cache.get(client, model, customKey)
        .then(instance => {
          if (instance) {
            return instance
          }

          return model.findOne.apply(model, arguments)
            .then(instance => cache.save(client, instance, customKey))
        })
    }
  }

  return {
    ...proxiedMethods,
    clear () {
      return cache.clearKey(client, model, customKey)
    },
    client() {
      return client
    }
  }
}